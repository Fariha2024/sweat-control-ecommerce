
const logger = require('../utils/logger');

const ORDER_STATUS = {
  PENDING: 'pending',
  PAYMENT_PROCESSING: 'payment_processing',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAYMENT_PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_PROCESSING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PACKED],
  [ORDER_STATUS.PACKED]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: []
};

const STATUS_DESCRIPTIONS = {
  [ORDER_STATUS.PENDING]: 'Order created, waiting for payment',
  [ORDER_STATUS.PAYMENT_PROCESSING]: 'Payment initiated, processing',
  [ORDER_STATUS.PAID]: 'Payment confirmed',
  [ORDER_STATUS.CONFIRMED]: 'Order confirmed, preparing for shipment',
  [ORDER_STATUS.PACKED]: 'Items packed, ready for shipping',
  [ORDER_STATUS.SHIPPED]: 'Order shipped, in transit',
  [ORDER_STATUS.DELIVERED]: 'Order delivered to customer',
  [ORDER_STATUS.CANCELLED]: 'Order cancelled',
  [ORDER_STATUS.REFUNDED]: 'Payment refunded'
};

class StateMachine {
  static canTransition(currentStatus, newStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
  }
  
  static getNextStatuses(currentStatus) {
    return ALLOWED_TRANSITIONS[currentStatus] || [];
  }
  
  static getStatusDescription(status) {
    return STATUS_DESCRIPTIONS[status] || 'Unknown status';
  }
  
  static isTerminal(status) {
    return status === ORDER_STATUS.DELIVERED || 
           status === ORDER_STATUS.CANCELLED || 
           status === ORDER_STATUS.REFUNDED;
  }
  
  static isActive(status) {
    return !this.isTerminal(status);
  }
  
  static async transition(order, newStatus, orderService, reason = null) {
    if (!this.canTransition(order.status, newStatus)) {
      throw new Error(
        `Cannot transition from ${order.status} to ${newStatus}. ` +
        `Allowed: ${this.getNextStatuses(order.status).join(', ')}`
      );
    }
    
    logger.info(`Order ${order.id}: ${order.status} → ${newStatus}${reason ? ` (${reason})` : ''}`);
    
    // Execute transition
    await orderService.updateStatus(order.id, newStatus, reason);
    
    return {
      orderId: order.id,
      oldStatus: order.status,
      newStatus,
      description: this.getStatusDescription(newStatus)
    };
  }
}

module.exports = { StateMachine, ORDER_STATUS };
