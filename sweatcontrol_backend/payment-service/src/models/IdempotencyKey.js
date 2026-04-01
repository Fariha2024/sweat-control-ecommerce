@'
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class IdempotencyKey {
  static async create(keyValue, orderId, gateway, ttlHours = 24) {
    const db = getPool();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);
    
    try {
      const [result] = await db.execute(
        `INSERT INTO idempotency_keys (key_value, order_id, gateway, expires_at)
         VALUES (?, ?, ?, ?)`,
        [keyValue, orderId, gateway, expiresAt]
      );
      
      return { success: true, id: result.insertId };
      
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return { success: false, error: 'Duplicate idempotency key' };
      }
      throw error;
    }
  }
  
  static async findByKey(keyValue) {
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT * FROM idempotency_keys WHERE key_value = ?',
      [keyValue]
    );
    return rows[0] || null;
  }
  
  static async markUsed(keyValue, responseData) {
    const db = getPool();
    await db.execute(
      'UPDATE idempotency_keys SET response_data = ? WHERE key_value = ?',
      [JSON.stringify(responseData), keyValue]
    );
  }
  
  static async cleanupExpired() {
    const db = getPool();
    const [result] = await db.execute(
      'DELETE FROM idempotency_keys WHERE expires_at < NOW()'
    );
    return result.affectedRows;
  }
}

module.exports = IdempotencyKey;
'@ | Out-File -FilePath src\models\IdempotencyKey.js -Encoding utf8