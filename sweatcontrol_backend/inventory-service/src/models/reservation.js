@'
const { getPool } = require('../config/db');
const logger = require('../utils/logger');

class Reservation {
  static async create(orderId, items, expiresInMinutes = 15) {
    const db = getPool();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    
    const reservations = [];
    
    for (const item of items) {
      const [result] = await db.execute(
        `INSERT INTO inventory_reservations (order_id, product_id, quantity_reserved, expires_at, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [orderId, item.product_id, item.quantity, expiresAt]
      );
      
      reservations.push({
        id: result.insertId,
        orderId,
        productId: item.product_id,
        quantity: item.quantity,
        expiresAt
      });
    }
    
    logger.info(`Created ${reservations.length} reservations for order ${orderId}`);
    return reservations;
  }
  
  static async findByOrderId(orderId) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT * FROM inventory_reservations 
       WHERE order_id = ? AND status = 'active'`,
      [orderId]
    );
    return rows;
  }
  
  static async releaseExpired() {
    const db = getPool();
    
    const [expired] = await db.execute(
      `SELECT * FROM inventory_reservations 
       WHERE status = 'active' AND expires_at < NOW()`
    );
    
    if (expired.length === 0) return 0;
    
    await db.execute(
      `UPDATE inventory_reservations 
       SET status = 'released' 
       WHERE status = 'active' AND expires_at < NOW()`
    );
    
    logger.info(`Released ${expired.length} expired reservations`);
    return expired.length;
  }
  
  static async convertToSale(orderId) {
    const db = getPool();
    
    const [result] = await db.execute(
      `UPDATE inventory_reservations 
       SET status = 'converted' 
       WHERE order_id = ? AND status = 'active'`,
      [orderId]
    );
    
    return result.affectedRows;
  }
  
  static async releaseOrderReservations(orderId) {
    const db = getPool();
    
    const [result] = await db.execute(
      `UPDATE inventory_reservations 
       SET status = 'released' 
       WHERE order_id = ? AND status = 'active'`,
      [orderId]
    );
    
    if (result.affectedRows > 0) {
      logger.info(`Released ${result.affectedRows} reservations for order ${orderId}`);
    }
    
    return result.affectedRows;
  }
}

module.exports = Reservation;
'@ | Out-File -FilePath src\models\Reservation.js -Encoding utf8