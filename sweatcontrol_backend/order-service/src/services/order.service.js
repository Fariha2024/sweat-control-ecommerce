
const { transaction } = require('../config/db');
const { Order, ORDER_STATUS } = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Customer = require('../models/Customer');
const cartClient = require('./cart.client');
const inventoryClient = require('./inventory.client');
const { StateMachine } = require('./state-machine');
const { sendEvent } = require('../config/kafka');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class OrderService {
  async createOrder(guestToken, customerData) {
    return await transaction(async (connection) => {
      // 1. Get cart from cart service
      const cart = await cartClient.getCart(guestToken);
      if (!cart || cart.items.length === 0) {
        throw new ValidationError('Cart is empty');
      }
      
      // 2. Check inventory for all items
      for (const item of cart.items) {
        const stockCheck = await inventoryClient.checkStock(item.product_id, item.quantity);
        if (!stockCheck.available) {
          throw new ValidationError(`Insufficient stock for product ID ${item.product_id}`);
        }
      }
      
      // 3. Create or find customer
      const customer = await Customer.findOrCreate(customerData);
      
      // 4. Create order
      const orderId = await Order.create({
        customer_id: customer.id,
        guest_token: guestToken,
        total_amount: cart.total,
        final_amount: cart.total,
        notes: customerData.notes
      }, connection);
      
      // 5. Create order items with product snapshots
      const orderItems = cart.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price_snapshot,
        product_snapshot: item.product || {}
      }));
      
      await OrderItem.create(orderId, orderItems, connection);
      
      // 6. Reserve inventory
      const reservation = await inventoryClient.reserveStock(orderId, orderItems);
      if (!reservation.success) {
        throw new Error('Failed to reserve inventory');
      }
      
      // 7. Clear cart
      await cartClient.clearCart(guestToken);
      
      // 8. Send order created event
      await sendEvent('order.created', {
        type: 'ORDER_CREATED',
        orderId,
        guestToken,
        customerId: customer.id,
        total: cart.total,
        items: orderItems
      });
      
      // 9. Return order details
      return {
        orderId,
        status: ORDER_STATUS.PENDING,
        customer,
        items: orderItems,
        total: cart.total
      };
    });
  }
  
  async getOrder(orderId) {
    const order = await Order.getOrderWithItems(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    
    const customer = await Customer.findById(order.customer_id);
    
    return {
      ...order,
      customer
    };
  }
  
  async getOrderByGuestToken(guestToken) {
    const orders = await Order.findByGuestToken(guestToken);
    return orders;
  }
  
  async updateStatus(orderId, newStatus, reason = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    
    const result = await StateMachine.transition(order, newStatus, this, reason);
    
    // Send status change event
    await sendEvent('order.status.updated', {
      type: 'ORDER_STATUS_UPDATED',
      orderId,
      oldStatus: order.status,
      newStatus,
      reason
    });
    
    return result;
  }
  
  async cancelOrder(orderId, reason) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    
    if (order.status !== ORDER_STATUS.PENDING && order.status !== ORDER_STATUS.PAID) {
      throw new ValidationError(`Cannot cancel order in ${order.status} status`);
    }
    
    // Release inventory reservation
    await inventoryClient.releaseReservation(orderId);
    
    // Update order status
    const result = await this.updateStatus(orderId, ORDER_STATUS.CANCELLED, reason);
    
    // Send cancellation event
    await sendEvent('order.cancelled', {
      type: 'ORDER_CANCELLED',
      orderId,
      reason
    });
    
    return result;
  }
  
  async handlePaymentSuccess(orderId, transactionId) {
    await Order.updatePayment(orderId, 'paid', transactionId);
    await this.updateStatus(orderId, ORDER_STATUS.PAID, 'Payment received');
    
    // Confirm inventory reservation
    await inventoryClient.confirmReservation(orderId);
    
    // Send payment success event
    await sendEvent('order.paid', {
      type: 'ORDER_PAID',
      orderId,
      transactionId
    });
    
    return { success: true };
  }
  
  async handlePaymentFailure(orderId, reason) {
    await Order.updatePayment(orderId, 'failed', null);
    
    // Release inventory reservation
    await inventoryClient.releaseReservation(orderId);
    
    // Send payment failure event
    await sendEvent('order.payment.failed', {
      type: 'ORDER_PAYMENT_FAILED',
      orderId,
      reason
    });
    
    return { success: true };
  }
  
  async trackOrder(orderId, phoneNumber) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    const customer = await Customer.findById(order.customer_id);
    if (customer.phone_number !== phoneNumber) {
      throw new ValidationError('Invalid phone number for this order');
    }
    
    return {
      orderId: order.id,
      status: order.status,
      statusDescription: StateMachine.getStatusDescription(order.status),
      estimatedDelivery: this.getEstimatedDelivery(order.created_at),
      items: await OrderItem.findByOrderId(orderId)
    };
  }
  
  getEstimatedDelivery(createdAt) {
    const created = new Date(createdAt);
    const estimated = new Date(created);
    
    // Add 3-7 days for delivery
    const daysToAdd = 3 + Math.floor(Math.random() * 5);
    estimated.setDate(estimated.getDate() + daysToAdd);
    
    return estimated.toISOString().split('T')[0];
  }
}

module.exports = new OrderService();
