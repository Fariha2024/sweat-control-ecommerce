
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class Cart {
  static async addItem(guestToken, productId, quantity, priceSnapshot) {
    const db = getPool();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(process.env.CART_EXPIRY_DAYS) || 7));
    
    const [existing] = await db.execute(
      'SELECT id, quantity FROM carts WHERE guest_token = ? AND product_id = ? AND status = "active"',
      [guestToken, productId]
    );
    
    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      await db.execute(
        'UPDATE carts SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      return this.findByGuestToken(guestToken);
    } else {
      await db.execute(
        `INSERT INTO carts (guest_token, product_id, quantity, price_snapshot, expires_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [guestToken, productId, quantity, priceSnapshot, expiresAt]
      );
      return this.findByGuestToken(guestToken);
    }
  }
  
  static async findByGuestToken(guestToken) {
    const db = getPool();
    
    const [rows] = await db.execute(
      `SELECT id, product_id, quantity, price_snapshot, created_at, expires_at
       FROM carts 
       WHERE guest_token = ? AND status = 'active'
       ORDER BY created_at DESC`,
      [guestToken]
    );
    
    return rows;
  }
  
  static async updateQuantity(cartId, quantity) {
    const db = getPool();
    
    await db.execute(
      'UPDATE carts SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, cartId]
    );
    
    const [rows] = await db.execute(
      'SELECT * FROM carts WHERE id = ?',
      [cartId]
    );
    
    return rows[0];
  }
  
  static async removeItem(cartId) {
    const db = getPool();
    
    await db.execute(
      'DELETE FROM carts WHERE id = ?',
      [cartId]
    );
    
    return true;
  }
  
  static async clearCart(guestToken) {
    const db = getPool();
    
    await db.execute(
      'UPDATE carts SET status = "abandoned" WHERE guest_token = ? AND status = "active"',
      [guestToken]
    );
    
    return true;
  }
  
  static async getCartTotal(guestToken) {
    const db = getPool();
    
    const [rows] = await db.execute(
      'SELECT SUM(quantity * price_snapshot) as total FROM carts WHERE guest_token = ? AND status = "active"',
      [guestToken]
    );
    
    return rows[0].total || 0;
  }
}

module.exports = Cart;
