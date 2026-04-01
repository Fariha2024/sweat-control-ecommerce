@'
const { getPool } = require('../config/db');
const { invalidateStockCache, setStockCache, getStockCache } = require('../config/redis');
const logger = require('../utils/logger');

class Stock {
  static async getStock(productId, useCache = true) {
    // Try cache first
    if (useCache) {
      const cached = await getStockCache(productId);
      if (cached) {
        return cached;
      }
    }
    
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT product_id, quantity, reserved_quantity, available_quantity, low_stock_threshold
       FROM stock WHERE product_id = ?`,
      [productId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const stock = rows[0];
    
    // Cache for 60 seconds
    await setStockCache(productId, stock, 60);
    
    return stock;
  }
  
  static async checkAvailability(productId, quantity) {
    const stock = await this.getStock(productId);
    if (!stock) return { available: false, reason: 'Product not found' };
    
    const available = stock.available_quantity >= quantity;
    return {
      available,
      stock: stock.quantity,
      reserved: stock.reserved_quantity,
      availableQuantity: stock.available_quantity,
      requested: quantity
    };
  }
  
  static async reserveStock(productId, quantity, connection) {
    const db = connection || getPool();
    
    const [result] = await db.execute(
      `UPDATE stock 
       SET reserved_quantity = reserved_quantity + ?,
           last_updated = NOW()
       WHERE product_id = ? AND (quantity - reserved_quantity) >= ?`,
      [quantity, productId, quantity]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, reason: 'Insufficient stock' };
    }
    
    // Invalidate cache
    await invalidateStockCache(productId);
    
    // Log movement
    await db.execute(
      `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
       VALUES (?, ?, 'reservation', ?, ?)`,
      [productId, -quantity, `reservation_${Date.now()}`, `Reserved ${quantity} units`]
    );
    
    return { success: true };
  }
  
  static async releaseReservation(productId, quantity, connection) {
    const db = connection || getPool();
    
    const [result] = await db.execute(
      `UPDATE stock 
       SET reserved_quantity = GREATEST(reserved_quantity - ?, 0),
           last_updated = NOW()
       WHERE product_id = ?`,
      [quantity, productId]
    );
    
    await invalidateStockCache(productId);
    
    await db.execute(
      `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
       VALUES (?, ?, 'release', ?, ?)`,
      [productId, quantity, `release_${Date.now()}`, `Released ${quantity} units`]
    );
    
    return { success: true };
  }
  
  static async confirmReservation(productId, quantity, connection) {
    const db = connection || getPool();
    
    const [result] = await db.execute(
      `UPDATE stock 
       SET quantity = quantity - ?,
           reserved_quantity = GREATEST(reserved_quantity - ?, 0),
           last_updated = NOW()
       WHERE product_id = ?`,
      [quantity, quantity, productId]
    );
    
    await invalidateStockCache(productId);
    
    await db.execute(
      `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
       VALUES (?, ?, 'sale', ?, ?)`,
      [productId, -quantity, `sale_${Date.now()}`, `Sold ${quantity} units`]
    );
    
    return { success: true };
  }
  
  static async updateStock(productId, newQuantity, reason = 'adjustment') {
    const db = getPool();
    
    const [stock] = await db.execute(
      'SELECT quantity FROM stock WHERE product_id = ?',
      [productId]
    );
    
    if (stock.length === 0) return { success: false };
    
    const oldQuantity = stock[0].quantity;
    const quantityChange = newQuantity - oldQuantity;
    
    const [result] = await db.execute(
      `UPDATE stock 
       SET quantity = ?, last_updated = NOW()
       WHERE product_id = ?`,
      [newQuantity, productId]
    );
    
    await invalidateStockCache(productId);
    
    await db.execute(
      `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
       VALUES (?, ?, 'adjustment', ?, ?)`,
      [productId, quantityChange, `adj_${Date.now()}`, reason]
    );
    
    return { success: result.affectedRows > 0 };
  }
}

module.exports = Stock;
'@ | Out-File -FilePath src\models\Stock.js -Encoding utf8