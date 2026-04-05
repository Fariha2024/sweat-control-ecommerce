
const axios = require('axios');
const logger = require('../utils/logger');

class OrderClient {
  constructor() {
    this.baseURL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';
    this.timeout = 10000;
  }

  async getOrder(orderId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/orders/${orderId}`,
        { timeout: this.timeout }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
      
    } catch (error) {
      logger.error('Order client error:', error.message);
      throw new Error('Failed to fetch order details');
    }
  }

  async updateOrderPaymentStatus(orderId, paymentStatus, transactionId) {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/orders/${orderId}/payment`,
        { paymentStatus, transactionId },
        { timeout: this.timeout }
      );
      
      return response.data && response.data.success;
      
    } catch (error) {
      logger.error('Update order payment status error:', error.message);
      return false;
    }
  }

  async confirmOrder(orderId) {
    try {
      const response = await axios.put(
        `${this.baseURL}/api/orders/${orderId}/status`,
        { status: 'confirmed' },
        { timeout: this.timeout }
      );
      
      return response.data && response.data.success;
      
    } catch (error) {
      logger.error('Confirm order error:', error.message);
      return false;
    }
  }
}

module.exports = new OrderClient();
