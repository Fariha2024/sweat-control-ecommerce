const productService = require('../services/product.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class ProductController {
  async getAllProducts(req, res, next) {
    try {
      logger.info('Fetching all products');
      const products = await productService.getAllProducts();
      return success(res, products, 'Products fetched successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      logger.info(`Fetching product ${id}`);
      const product = await productService.getProductById(parseInt(id));
      return success(res, product, 'Product fetched successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async checkStock(req, res, next) {
    try {
      const { productId, quantity } = req.query;
      
      if (!productId || !quantity) {
        return error(res, 'productId and quantity are required', 400);
      }
      
      const result = await productService.checkStock(
        parseInt(productId), 
        parseInt(quantity)
      );
      
      return success(res, result, 'Stock check completed');
    } catch (err) {
      next(err);
    }
  }
  
  async searchProducts(req, res, next) {
    try {
      const { q } = req.query;
      const products = await productService.searchProducts(q);
      return success(res, products, 'Search completed');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();