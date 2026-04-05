
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class Transaction {
  static async create(transactionData) {
    const db = getPool();
    
    const [result] = await db.execute(
      `INSERT INTO payment_transactions 
       (order_id, user_id, gateway, amount, currency, status, idempotency_key, raw_gateway_response)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionData.order_id,
        transactionData.user_id || null,
        transactionData.gateway,
        transactionData.amount,
        transactionData.currency || 'PKR',
        transactionData.status || 'initiated',
        transactionData.idempotency_key,
        transactionData.raw_gateway_response ? JSON.stringify(transactionData.raw_gateway_response) : null
      ]
    );
    
    return result.insertId;
  }
  
  static async updateStatus(transactionId, status, transactionReference = null, responseData = null) {
    const db = getPool();
    
    await db.execute(
      `UPDATE payment_transactions 
       SET status = ?, transaction_reference = ?, raw_gateway_response = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, transactionReference, responseData ? JSON.stringify(responseData) : null, transactionId]
    );
    
    return true;
  }
  
  static async findById(transactionId) {
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT * FROM payment_transactions WHERE id = ?',
      [transactionId]
    );
    return rows[0] || null;
  }
  
  static async findByOrderId(orderId) {
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  }
  
  static async findByIdempotencyKey(idempotencyKey) {
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT * FROM payment_transactions WHERE idempotency_key = ?',
      [idempotencyKey]
    );
    return rows[0] || null;
  }
  
  static async getOrderTransactions(orderId) {
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  }
}

module.exports = Transaction;
