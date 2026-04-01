@'
const axios = require('axios');
const logger = require('../utils/logger');

class ProductClient {
  constructor() {
    this.baseURL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
    this.timeout = 5000;
  }

  async getProduct(productId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/products/${productId}`,
        { timeout: this.timeout }
      );
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.error(`Product service unavailable: ${this.baseURL}`);
        throw new Error('Product service is unavailable');
      }
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Product client error:', error.message);
      throw new Error('Failed to fetch product details');
    }
  }

  async checkStock(productId, quantity) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/products/check-stock?productId=${productId}&quantity=${quantity}`,
        { timeout: this.timeout }
      );
      
      if (response.data && response.data.success) {
        return {
          available: true,
          stock: response.data.data.stock,
          price: response.data.data.price || 0
        };
      }
      return { available: false };
      
    } catch (error) {
      logger.error('Stock check error:', error.message);
      return { available: false, error: error.message };
    }
  }

  async getProductsBatch(productIds) {
    try {
      const promises = productIds.map(id => this.getProduct(id));
      const results = await Promise.allSettled(promises);
      
      const products = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          products[productIds[index]] = result.value;
        }
      });
      
      return products;
      
    } catch (error) {
      logger.error('Batch product fetch error:', error.message);
      return {};
    }
  }
}

module.exports = new ProductClient();
'@ | Out-File -FilePath src\services\product.client.js -Encoding utf8