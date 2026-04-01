@'
const { getPool } = require('../config/db');

class OrderItem {
  static async create(orderId, items, connection = null) {
    const db = connection || getPool();
    
    for (const item of items) {
      await db.execute(
        `INSERT INTO order_items 
         (order_id, product_id, quantity, price_at_purchase, product_snapshot)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          JSON.stringify(item.product_snapshot || {})
        ]
      );
    }
    
    return true;
  }
  
  static async findByOrderId(orderId) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );
    return rows;
  }
}

module.exports = OrderItem;
'@ | Out-File -FilePath src\models\OrderItem.js -Encoding utf8