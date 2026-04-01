const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class Product {
  static async findAllActive() {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT id, product_name, description, unit_price_pkr, 
              stock_quantity, minimum_quantity, maximum_quantity,
              quantity_unit, is_active
       FROM products 
       WHERE is_active = 1 AND is_deleted = 0
       ORDER BY created_at DESC`
    );
    
    return rows;
  }
  
  static async findById(id) {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT id, product_name, description, unit_price_pkr, 
              stock_quantity, minimum_quantity, maximum_quantity,
              quantity_unit, is_active, is_deleted
       FROM products 
       WHERE id = ?`,
      [id]
    );
    
    if (!rows[0] || rows[0].is_deleted === 1) {
      return null;
    }
    
    return rows[0];
  }
  
  static async hasEnoughStock(productId, requestedQuantity) {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT stock_quantity 
       FROM products 
       WHERE id = ? AND is_active = 1 AND is_deleted = 0`,
      [productId]
    );
    
    if (!rows[0]) return false;
    return rows[0].stock_quantity >= requestedQuantity;
  }
  
  static async searchByName(searchTerm) {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT id, product_name, unit_price_pkr, description
       FROM products 
       WHERE product_name LIKE ? 
         AND is_active = 1 
         AND is_deleted = 0
       LIMIT 20`,
      [`%${searchTerm}%`]
    );
    
    return rows;
  }
  
  static async getProductWithStats(productId) {
    const product = await this.findById(productId);
    if (!product) return null;
    
    const pool = getPool();
    
    // Get review stats
    const [reviewStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_reviews,
         AVG(rating) as average_rating,
         COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
         COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
         COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
         COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
         COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews 
       WHERE product_id = ? AND is_approved = 1`,
      [productId]
    );
    
    return {
      ...product,
      reviews: {
        total: reviewStats[0].total_reviews || 0,
        average: parseFloat(reviewStats[0].average_rating || 0).toFixed(1),
        distribution: {
          5: reviewStats[0].five_star || 0,
          4: reviewStats[0].four_star || 0,
          3: reviewStats[0].three_star || 0,
          2: reviewStats[0].two_star || 0,
          1: reviewStats[0].one_star || 0,
        }
      }
    };
  }
}

module.exports = Product;