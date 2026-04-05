const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class StockMovement {
  // Basic CRUD operations
  static async create(movementData) {
    const db = getPool();
    const [result] = await db.execute(
      `INSERT INTO stock_movements (product_id, quantity_change, type, reference_id, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [movementData.product_id, movementData.quantity_change, 
       movementData.type, movementData.reference_id, movementData.notes]
    );
    return result.insertId;
  }
  
  // Get movements with pagination (important for large datasets)
  static async getByProductId(productId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const db = getPool();
    
    const [rows] = await db.execute(
      `SELECT * FROM stock_movements 
       WHERE product_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );
    
    const [count] = await db.execute(
      `SELECT COUNT(*) as total FROM stock_movements WHERE product_id = ?`,
      [productId]
    );
    
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count[0].total,
        totalPages: Math.ceil(count[0].total / limit)
      }
    };
  }
  
  // Get movements by date range (for reporting)
  static async getByDateRange(startDate, endDate, productId = null) {
    const db = getPool();
    let query = `SELECT * FROM stock_movements 
                 WHERE created_at BETWEEN ? AND ?`;
    let params = [startDate, endDate];
    
    if (productId) {
      query += ` AND product_id = ?`;
      params.push(productId);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
  
  // Get summary statistics (for analytics)
  static async getStatistics(productId, days = 30) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT 
         type,
         COUNT(*) as count,
         SUM(ABS(quantity_change)) as total_quantity,
         DATE(created_at) as date
       FROM stock_movements 
       WHERE product_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY type, DATE(created_at)
       ORDER BY date DESC`,
      [productId, days]
    );
    return rows;
  }
  
  // Get stock turnover rate (important for scalability)
  static async getTurnoverRate(productId, days = 30) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT 
         SUM(CASE WHEN type = 'sale' THEN ABS(quantity_change) ELSE 0 END) as total_sold,
         SUM(CASE WHEN type = 'adjustment' AND quantity_change > 0 THEN quantity_change ELSE 0 END) as total_restocked,
         COUNT(DISTINCT DATE(created_at)) as active_days
       FROM stock_movements 
       WHERE product_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [productId, days]
    );
    return rows[0];
  }
  
  // Archive old movements (for performance)
  static async archiveOldMovements(daysToKeep = 90) {
    const db = getPool();
    const [result] = await db.execute(
      `INSERT INTO stock_movements_archive 
       SELECT * FROM stock_movements 
       WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysToKeep]
    );
    
    await db.execute(
      `DELETE FROM stock_movements 
       WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysToKeep]
    );
    
    logger.info(`Archived ${result.affectedRows} old stock movements`);
    return result.affectedRows;
  }
  
  // Real-time alerts for unusual patterns (scalability feature)
  static async detectAnomalies(productId) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT 
         AVG(ABS(quantity_change)) as avg_movement,
         STDDEV(ABS(quantity_change)) as std_movement
       FROM stock_movements 
       WHERE product_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [productId]
    );
    
    const [recent] = await db.execute(
      `SELECT * FROM stock_movements 
       WHERE product_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
         AND ABS(quantity_change) > ? + (2 * ?)`,
      [productId, rows[0].avg_movement, rows[0].std_movement]
    );
    
    return recent;
  }
}

module.exports = StockMovement;