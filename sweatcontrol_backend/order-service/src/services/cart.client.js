
const axios = require('axios');
const logger = require('../utils/logger');

class CartClient {
  constructor() {
    this.baseURL = process.env.CART_SERVICE_URL || 'http://localhost:3002';
    this.timeout = 10000;
  }

  async getCart(guestToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/cart`,
        { 
          params: { guestToken },
          timeout: this.timeout 
        }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.error(`Cart service unavailable: ${this.baseURL}`);
        throw new Error('Cart service is unavailable');
      }
      logger.error('Cart client error:', error.message);
      throw new Error('Failed to fetch cart');
    }
  }

  async clearCart(guestToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/cart/clear`,
        { guestToken },
        { timeout: this.timeout }
      );
      
      return response.data && response.data.success;
      
    } catch (error) {
      logger.error('Clear cart error:', error.message);
      return false;
    }
  }
}

module.exports = new CartClient();
