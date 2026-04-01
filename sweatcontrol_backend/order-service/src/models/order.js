@'
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

const ORDER_STATUS = {
  PENDING: 'pending',
  PAYMENT_PROCESSING: 'payment_processing',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAYMENT_PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAYMENT_PROCESSING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PACKED],
  [ORDER_STATUS.PACKED]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: []
};

class Order {
  static async create(orderData, connection = null) {
    const db = connection || getPool();
    
    const [result] = await db.execute(
      `INSERT INTO orders 
       (customer_id, guest_token, total_amount, discount_amount, final_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderData.customer_id,
        orderData.guest_token,
        orderData.total_amount,
        orderData.discount_amount || 0,
        orderData.final_amount,
        orderData.notes || null
      ]
    );
    
    return result.insertId;
  }
  
  static async findById(id) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT * FROM orders WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  }
  
  static async findByGuestToken(guestToken) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT * FROM orders WHERE guest_token = ? AND is_deleted = 0 ORDER BY created_at DESC`,
      [guestToken]
    );
    return rows;
  }
  
  static async updateStatus(orderId, newStatus, changedBy = 'system', comment = null) {
    const db = getPool();
    
    // Get current order
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }
    
    // Update order status
    await db.execute(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, orderId]
    );
    
    // Log status change
    await db.execute(
      `INSERT INTO order_status_logs (order_id, old_status, new_status, changed_by, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, order.status, newStatus, changedBy, comment]
    );
    
    logger.info(`Order ${orderId} status changed: ${order.status} → ${newStatus}`);
    
    return {
      orderId,
      oldStatus: order.status,
      newStatus,
      changedBy,
      comment
    };
  }
  
  static async updatePayment(orderId, paymentStatus, transactionId) {
    const db = getPool();
    
    await db.execute(
      `UPDATE orders 
       SET payment_status = ?, transaction_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [paymentStatus, transactionId, orderId]
    );
    
    if (paymentStatus === 'paid') {
      await this.updateStatus(orderId, ORDER_STATUS.PAID, 'payment');
    }
  }
  
  static async getOrderWithItems(orderId) {
    const db = getPool();
    
    const order = await this.findById(orderId);
    if (!order) return null;
    
    const [items] = await db.execute(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );
    
    const [logs] = await db.execute(
      `SELECT * FROM order_status_logs WHERE order_id = ? ORDER BY created_at DESC`,
      [orderId]
    );
    
    return {
      ...order,
      items,
      statusHistory: logs
    };
  }
}

module.exports = { Order, ORDER_STATUS, ALLOWED_TRANSITIONS };
'@ | Out-File -FilePath src\models\Order.js -Encoding utf8