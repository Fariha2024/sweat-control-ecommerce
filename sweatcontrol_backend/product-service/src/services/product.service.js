
const Product = require('../models/Product');
const { setCache, getCache, invalidateCache } = require('../config/redis');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class ProductService {
  async getAllProducts() {
    const cacheKey = 'products:all';
    
    const cached = await getCache(cacheKey);
    if (cached) {
      logger.debug('Returning products from cache');
      return cached;
    }
    
    const products = await Product.findAllActive();
    
    const formatted = products.map(product => ({
      id: product.id,
      name: product.product_name,
      description: product.description,
      price: parseFloat(product.unit_price_pkr),
      stock: product.stock_quantity,
      minQuantity: product.minimum_quantity,
      maxQuantity: product.maximum_quantity,
      unit: product.quantity_unit
    }));
    
    await setCache(cacheKey, formatted, 300);
    return formatted;
  }
  
  async getProductById(productId) {
    const cacheKey = `product:${productId}`;
    
    const cached = await getCache(cacheKey);
    if (cached) return cached;
    
    const product = await Product.getProductWithStats(productId);
    if (!product) throw new NotFoundError(`Product with ID ${productId} not found`);
    if (!product.is_active) throw new ValidationError('Product is not available');
    
    const formatted = {
      id: product.id,
      name: product.product_name,
      description: product.description,
      price: parseFloat(product.unit_price_pkr),
      stock: product.stock_quantity,
      minQuantity: product.minimum_quantity,
      maxQuantity: product.maximum_quantity,
      unit: product.quantity_unit,
      reviews: product.reviews
    };
    
    await setCache(cacheKey, formatted, 300);
    return formatted;
  }
  
  async checkStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError(`Product with ID ${productId} not found`);
    
    const hasStock = await Product.hasEnoughStock(productId, quantity);
    if (!hasStock) throw new ValidationError(`Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity}`);
    
    return {
      available: true,
      stock: product.stock_quantity,
      requested: quantity,
      price: parseFloat(product.unit_price_pkr)  // ADDED PRICE
    };
  }
  
  async searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) throw new ValidationError('Search term must be at least 2 characters');
    const products = await Product.searchByName(searchTerm.trim());
    return products.map(p => ({
      id: p.id,
      name: p.product_name,
      price: parseFloat(p.unit_price_pkr),
      description: p.description
    }));
  }
  
  async invalidateProductCache(productId) {
    await invalidateCache(`product:${productId}`);
    await invalidateCache('products:all');
    logger.info(`Invalidated cache for product ${productId}`);
  }
}

module.exports = new ProductService();
