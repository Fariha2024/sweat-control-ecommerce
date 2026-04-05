const { getPool } = require('../config/db');
const { invalidateStockCache, setStockCache, getStockCache } = require('../config/redis');
const logger = require('../utils/logger');

class Stock {
  /**
   * Get stock information for a product
   * @param {number} productId - Product ID
   * @param {boolean} useCache - Whether to use Redis cache
   * @returns {Promise<Object|null>} Stock object or null if not found
   */
  static async getStock(productId, useCache = true) {
    try {
      // Validate input
      if (!productId || productId <= 0) {
        logger.warn(`Invalid product ID: ${productId}`);
        return null;
      }

      // Try cache first
      if (useCache) {
        try {
          const cached = await getStockCache(productId);
          if (cached) {
            return cached;
          }
        } catch (cacheError) {
          logger.warn(`Cache read failed for product ${productId}:`, cacheError.message);
        }
      }
      
      const db = getPool();
      const [rows] = await db.execute(
        `SELECT product_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, last_updated
         FROM stock WHERE product_id = ?`,
        [productId]
      );
      
      if (rows.length === 0) {
        logger.warn(`Stock not found for product ${productId}`);
        return null;
      }
      
      const stock = rows[0];
      
      // Cache for 60 seconds (with error handling)
      try {
        await setStockCache(productId, stock, 60);
      } catch (cacheError) {
        logger.warn(`Cache write failed for product ${productId}:`, cacheError.message);
      }
      
      return stock;
    } catch (error) {
      logger.error(`Error getting stock for product ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if requested quantity is available
   * @param {number} productId - Product ID
   * @param {number} quantity - Requested quantity
   * @returns {Promise<Object>} Availability status
   */
  static async checkAvailability(productId, quantity) {
    try {
      // Validate inputs
      if (!productId || productId <= 0) {
        return { available: false, reason: 'Invalid product ID' };
      }
      
      if (!quantity || quantity <= 0) {
        return { available: false, reason: 'Quantity must be greater than 0' };
      }
      
      const stock = await this.getStock(productId);
      if (!stock) {
        return { available: false, reason: 'Product not found in inventory' };
      }
      
      const available = stock.available_quantity >= quantity;
      return {
        available,
        stock: stock.quantity,
        reserved: stock.reserved_quantity,
        availableQuantity: stock.available_quantity,
        requested: quantity,
        lowStockThreshold: stock.low_stock_threshold,
        isLowStock: stock.available_quantity <= stock.low_stock_threshold
      };
    } catch (error) {
      logger.error(`Error checking availability for product ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reserve stock for an order
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to reserve
   * @param {Object} connection - Database connection for transactions
   * @returns {Promise<Object>} Reservation result
   */
  static async reserveStock(productId, quantity, connection = null) {
    try {
      // Validate inputs
      if (!productId || productId <= 0) {
        return { success: false, reason: 'Invalid product ID' };
      }
      
      if (!quantity || quantity <= 0) {
        return { success: false, reason: 'Quantity must be greater than 0' };
      }
      
      const db = connection || getPool();
      
      const [result] = await db.execute(
        `UPDATE stock 
         SET reserved_quantity = reserved_quantity + ?,
             last_updated = NOW()
         WHERE product_id = ? AND (quantity - reserved_quantity) >= ?`,
        [quantity, productId, quantity]
      );
      
      if (result.affectedRows === 0) {
        // Check if product exists
        const [stock] = await db.execute(
          'SELECT quantity, reserved_quantity FROM stock WHERE product_id = ?',
          [productId]
        );
        
        if (stock.length === 0) {
          return { success: false, reason: 'Product not found in inventory' };
        }
        
        const available = stock[0].quantity - stock[0].reserved_quantity;
        return { 
          success: false, 
          reason: `Insufficient stock. Available: ${available}, Requested: ${quantity}` 
        };
      }
      
      // Invalidate cache (with error handling)
      try {
        await invalidateStockCache(productId);
      } catch (cacheError) {
        logger.warn(`Cache invalidation failed for product ${productId}:`, cacheError.message);
      }
      
      // Log movement
      await db.execute(
        `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
         VALUES (?, ?, 'reservation', ?, ?)`,
        [productId, -quantity, `reservation_${Date.now()}`, `Reserved ${quantity} units for order`]
      );
      
      logger.info(`Reserved ${quantity} units of product ${productId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error reserving stock for product ${productId}:`, error);
      return { success: false, reason: error.message };
    }
  }
  
  /**
   * Release previously reserved stock
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to release
   * @param {Object} connection - Database connection for transactions
   * @returns {Promise<Object>} Release result
   */
  static async releaseReservation(productId, quantity, connection = null) {
    try {
      // Validate inputs
      if (!productId || productId <= 0) {
        return { success: false, reason: 'Invalid product ID' };
      }
      
      if (!quantity || quantity <= 0) {
        return { success: false, reason: 'Quantity must be greater than 0' };
      }
      
      const db = connection || getPool();
      
      const [result] = await db.execute(
        `UPDATE stock 
         SET reserved_quantity = GREATEST(reserved_quantity - ?, 0),
             last_updated = NOW()
         WHERE product_id = ?`,
        [quantity, productId]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, reason: 'Product not found' };
      }
      
      // Invalidate cache
      try {
        await invalidateStockCache(productId);
      } catch (cacheError) {
        logger.warn(`Cache invalidation failed for product ${productId}:`, cacheError.message);
      }
      
      // Log movement
      await db.execute(
        `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
         VALUES (?, ?, 'release', ?, ?)`,
        [productId, quantity, `release_${Date.now()}`, `Released ${quantity} units`]
      );
      
      logger.info(`Released ${quantity} units of product ${productId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error releasing reservation for product ${productId}:`, error);
      return { success: false, reason: error.message };
    }
  }
  
  /**
   * Confirm reservation and convert to actual sale
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to confirm
   * @param {Object} connection - Database connection for transactions
   * @returns {Promise<Object>} Confirmation result
   */
  static async confirmReservation(productId, quantity, connection = null) {
    try {
      // Validate inputs
      if (!productId || productId <= 0) {
        return { success: false, reason: 'Invalid product ID' };
      }
      
      if (!quantity || quantity <= 0) {
        return { success: false, reason: 'Quantity must be greater than 0' };
      }
      
      const db = connection || getPool();
      
      const [result] = await db.execute(
        `UPDATE stock 
         SET quantity = quantity - ?,
             reserved_quantity = GREATEST(reserved_quantity - ?, 0),
             last_updated = NOW()
         WHERE product_id = ? AND quantity >= ?`,
        [quantity, quantity, productId, quantity]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, reason: 'Insufficient stock or product not found' };
      }
      
      // Invalidate cache
      try {
        await invalidateStockCache(productId);
      } catch (cacheError) {
        logger.warn(`Cache invalidation failed for product ${productId}:`, cacheError.message);
      }
      
      // Log movement
      await db.execute(
        `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
         VALUES (?, ?, 'sale', ?, ?)`,
        [productId, -quantity, `sale_${Date.now()}`, `Sold ${quantity} units`]
      );
      
      logger.info(`Confirmed sale of ${quantity} units of product ${productId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Error confirming reservation for product ${productId}:`, error);
      return { success: false, reason: error.message };
    }
  }
  
  /**
   * Update stock quantity (adjustment)
   * @param {number} productId - Product ID
   * @param {number} newQuantity - New quantity
   * @param {string} reason - Reason for adjustment
   * @returns {Promise<Object>} Update result
   */
  static async updateStock(productId, newQuantity, reason = 'adjustment') {
    try {
      // Validate inputs
      if (!productId || productId <= 0) {
        return { success: false, reason: 'Invalid product ID' };
      }
      
      if (newQuantity === undefined || newQuantity < 0) {
        return { success: false, reason: 'Invalid quantity' };
      }
      
      const db = getPool();
      
      const [stock] = await db.execute(
        'SELECT quantity FROM stock WHERE product_id = ?',
        [productId]
      );
      
      if (stock.length === 0) {
        return { success: false, reason: 'Product not found' };
      }
      
      const oldQuantity = stock[0].quantity;
      const quantityChange = newQuantity - oldQuantity;
      
      const [result] = await db.execute(
        `UPDATE stock 
         SET quantity = ?, 
             last_updated = NOW()
         WHERE product_id = ?`,
        [newQuantity, productId]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, reason: 'Update failed' };
      }
      
      // Invalidate cache
      try {
        await invalidateStockCache(productId);
      } catch (cacheError) {
        logger.warn(`Cache invalidation failed for product ${productId}:`, cacheError.message);
      }
      
      // Log movement
      await db.execute(
        `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
         VALUES (?, ?, 'adjustment', ?, ?)`,
        [productId, quantityChange, `adj_${Date.now()}`, reason]
      );
      
      logger.info(`Updated stock for product ${productId}: ${oldQuantity} -> ${newQuantity} (${reason})`);
      return { success: true, oldQuantity, newQuantity, quantityChange };
    } catch (error) {
      logger.error(`Error updating stock for product ${productId}:`, error);
      return { success: false, reason: error.message };
    }
  }
  
  /**
   * Get products with low stock
   * @param {number} threshold - Custom threshold (optional)
   * @returns {Promise<Array>} List of low stock products
   */
  static async getLowStockProducts(threshold = null) {
    try {
      const db = getPool();
      const thresholdValue = threshold || 10;
      
      const [rows] = await db.execute(
        `SELECT product_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, last_updated
         FROM stock 
         WHERE available_quantity <= low_stock_threshold OR available_quantity <= ?
         ORDER BY available_quantity ASC`,
        [thresholdValue]
      );
      
      logger.info(`Found ${rows.length} low stock products`);
      return rows;
    } catch (error) {
      logger.error('Error getting low stock products:', error);
      throw error;
    }
  }
  
  /**
   * Bulk update stock for multiple products
   * @param {Array} updates - Array of {product_id, quantity} objects
   * @returns {Promise<Object>} Bulk update result
   */
  static async bulkUpdateStock(updates) {
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return { success: false, reason: 'Invalid updates array' };
    }
    
    const db = getPool();
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const update of updates) {
        if (!update.product_id || update.quantity === undefined) {
          throw new Error(`Invalid update object: ${JSON.stringify(update)}`);
        }
        
        const [stock] = await connection.execute(
          'SELECT quantity FROM stock WHERE product_id = ?',
          [update.product_id]
        );
        
        if (stock.length === 0) {
          throw new Error(`Product ${update.product_id} not found`);
        }
        
        const oldQuantity = stock[0].quantity;
        const quantityChange = update.quantity - oldQuantity;
        
        await connection.execute(
          `UPDATE stock 
           SET quantity = ?, last_updated = NOW()
           WHERE product_id = ?`,
          [update.quantity, update.product_id]
        );
        
        // Log movement
        await connection.execute(
          `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
           VALUES (?, ?, 'bulk_adjustment', ?, ?)`,
          [update.product_id, quantityChange, `bulk_${Date.now()}`, 'Bulk stock update']
        );
        
        // Invalidate cache
        try {
          await invalidateStockCache(update.product_id);
        } catch (cacheError) {
          logger.warn(`Cache invalidation failed for product ${update.product_id}:`, cacheError.message);
        }
        
        results.push({
          product_id: update.product_id,
          oldQuantity,
          newQuantity: update.quantity,
          quantityChange
        });
      }
      
      await connection.commit();
      logger.info(`Bulk updated ${results.length} products`);
      return { success: true, results };
    } catch (error) {
      await connection.rollback();
      logger.error('Error in bulk stock update:', error);
      return { success: false, reason: error.message };
    } finally {
      connection.release();
    }
  }
  
  /**
   * Get stock movement history for a product
   * @param {number} productId - Product ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Stock movements
   */
  static async getStockMovements(productId, limit = 50) {
    try {
      if (!productId || productId <= 0) {
        throw new Error('Invalid product ID');
      }
      
      const db = getPool();
      const [rows] = await db.execute(
        `SELECT id, product_id, quantity_change, type, reference_id, notes, created_at
         FROM stock_movements 
         WHERE product_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [productId, limit]
      );
      
      return rows;
    } catch (error) {
      logger.error(`Error getting stock movements for product ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check availability for multiple products at once
   * @param {Array} items - Array of {productId, quantity} objects
   * @returns {Promise<Array>} Availability results
   */
  static async checkBulkAvailability(items) {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid items array');
      }
      
      const results = [];
      for (const item of items) {
        const availability = await this.checkAvailability(item.productId, item.quantity);
        results.push({
          productId: item.productId,
          ...availability
        });
      }
      
      return results;
    } catch (error) {
      logger.error('Error in bulk availability check:', error);
      throw error;
    }
  }
  
  /**
   * Get all stock items (for admin/sync purposes)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated stock list
   */
  static async getAllStock(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const db = getPool();
      
      const [rows] = await db.execute(
        `SELECT product_id, quantity, reserved_quantity, available_quantity, low_stock_threshold, last_updated
         FROM stock 
         ORDER BY product_id
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      const [countResult] = await db.execute('SELECT COUNT(*) as total FROM stock');
      const total = countResult[0].total;
      
      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting all stock:', error);
      throw error;
    }
  }
}

module.exports = Stock;