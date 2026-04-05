
const axios = require('axios');
const logger = require('../utils/logger');

class InventoryClient {
  constructor() {
    this.baseURL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004';
    this.timeout = 10000;
  }

  async reserveStock(orderId, items) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/inventory/reserve`,
        { orderId, items },
        { timeout: this.timeout }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return { success: false, error: 'Reservation failed' };
      
    } catch (error) {
      logger.error('Reserve stock error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async releaseReservation(orderId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/inventory/release`,
        { orderId },
        { timeout: this.timeout }
      );
      
      return response.data && response.data.success;
      
    } catch (error) {
      logger.error('Release reservation error:', error.message);
      return false;
    }
  }

  async confirmReservation(orderId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/inventory/confirm`,
        { orderId },
        { timeout: this.timeout }
      );
      
      return response.data && response.data.success;
      
    } catch (error) {
      logger.error('Confirm reservation error:', error.message);
      return false;
    }
  }

  async checkStock(productId, quantity) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/inventory/check`,
        { 
          params: { productId, quantity },
          timeout: this.timeout 
        }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return { available: false };
      
    } catch (error) {
      logger.error('Check stock error:', error.message);
      return { available: false, error: error.message };
    }
  }
}

module.exports = new InventoryClient();
