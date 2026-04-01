const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class Review {
  static async create(reviewData) {
    const pool = getPool();
    const { product_id, reviewer_name, email, rating, comment, phone_number } = reviewData;
    
    const [result] = await pool.execute(
      `INSERT INTO reviews 
       (product_id, reviewer_name, email, rating, comment, phone_number, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_id, reviewer_name, email, rating, comment, phone_number, 1] // Auto-approve for now
    );
    
    return this.findById(result.insertId);
  }
  
  static async findById(id) {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT id, product_id, reviewer_name, rating, comment, 
              created_at, is_approved
       FROM reviews 
       WHERE id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }
  
  static async findByProductId(productId, page = 1, limit = 10) {
    const pool = getPool();
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT id, reviewer_name, rating, comment, created_at
       FROM reviews 
       WHERE product_id = ? AND is_approved = 1
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );
    
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM reviews 
       WHERE product_id = ? AND is_approved = 1`,
      [productId]
    );
    
    return {
      reviews: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
  
  static async getReviewStats(productId) {
    const pool = getPool();
    
    const [rows] = await pool.execute(
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
      total: rows[0].total_reviews || 0,
      average: parseFloat(rows[0].average_rating || 0).toFixed(1),
      distribution: {
        5: rows[0].five_star || 0,
        4: rows[0].four_star || 0,
        3: rows[0].three_star || 0,
        2: rows[0].two_star || 0,
        1: rows[0].one_star || 0,
      }
    };
  }
  
  static async checkDuplicate(productId, email) {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT id FROM reviews 
       WHERE product_id = ? AND email = ?`,
      [productId, email]
    );
    
    return rows.length > 0;
  }
}

module.exports = Review;