
const orderService = require('../services/order.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { guestToken, customer } = req.body;
      
      if (!guestToken || !customer) {
        return error(res, 'guestToken and customer are required', 400);
      }
      
      if (!customer.email || !customer.phone_number) {
        return error(res, 'customer email and phone_number are required', 400);
      }
      
      const order = await orderService.createOrder(guestToken, customer);
      
      logger.info(`Order created: ${order.orderId}`);
      return success(res, order, 'Order created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
  
  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrder(parseInt(id));
      return success(res, order, 'Order retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async getOrdersByGuestToken(req, res, next) {
    try {
      const { guestToken } = req.query;
      
      if (!guestToken) {
        return error(res, 'guestToken is required', 400);
      }
      
      const orders = await orderService.getOrderByGuestToken(guestToken);
      return success(res, orders, 'Orders retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const result = await orderService.cancelOrder(parseInt(id), reason || 'User requested cancellation');
      return success(res, result, 'Order cancelled successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async trackOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { phoneNumber } = req.query;
      
      if (!phoneNumber) {
        return error(res, 'phoneNumber is required for tracking', 400);
      }
      
      const tracking = await orderService.trackOrder(parseInt(id), phoneNumber);
      return success(res, tracking, 'Order tracking information');
    } catch (err) {
      next(err);
    }
  }
  
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      if (!status) {
        return error(res, 'status is required', 400);
      }
      
      const result = await orderService.updateStatus(parseInt(id), status, reason);
      return success(res, result, 'Order status updated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderController();
