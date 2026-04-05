const { getPool } = require('../config/db');
const logger = require('../utils/logger');
const Stock = require('./Stock'); // Add this import

class Reservation {
  static async create(orderId, items, expiresInMinutes = 15) {
    const db = getPool();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    
    const reservations = [];
    
    for (const item of items) {
      // First reserve in stock table
      const stockReservation = await Stock.reserveStock(item.product_id, item.quantity);
      if (!stockReservation.success) {
        throw new Error(`Failed to reserve stock for product ${item.product_id}`);
      }
      
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
  
  static async findById(reservationId) {
    const db = getPool();
    const [rows] = await db.execute(
      `SELECT * FROM inventory_reservations WHERE id = ?`,
      [reservationId]
    );
    return rows[0];
  }
  
  static async releaseExpired() {
    const db = getPool();
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [expired] = await connection.execute(
        `SELECT * FROM inventory_reservations 
         WHERE status = 'active' AND expires_at < NOW()`
      );
      
      if (expired.length === 0) return 0;
      
      // Release stock for each expired reservation
      for (const reservation of expired) {
        await Stock.releaseReservation(
          reservation.product_id, 
          reservation.quantity_reserved,
          connection
        );
      }
      
      await connection.execute(
        `UPDATE inventory_reservations 
         SET status = 'released' 
         WHERE status = 'active' AND expires_at < NOW()`
      );
      
      await connection.commit();
      logger.info(`Released ${expired.length} expired reservations`);
      return expired.length;
    } catch (error) {
      await connection.rollback();
      logger.error('Error releasing expired reservations:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async convertToSale(orderId) {
    const db = getPool();
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [reservations] = await connection.execute(
        `SELECT * FROM inventory_reservations 
         WHERE order_id = ? AND status = 'active'`,
        [orderId]
      );
      
      if (reservations.length === 0) return 0;
      
      // Confirm stock for each reservation
      for (const reservation of reservations) {
        await Stock.confirmReservation(
          reservation.product_id,
          reservation.quantity_reserved,
          connection
        );
      }
      
      const [result] = await connection.execute(
        `UPDATE inventory_reservations 
         SET status = 'converted' 
         WHERE order_id = ? AND status = 'active'`,
        [orderId]
      );
      
      await connection.commit();
      logger.info(`Converted ${result.affectedRows} reservations to sale for order ${orderId}`);
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      logger.error('Error converting reservations to sale:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async releaseOrderReservations(orderId) {
    const db = getPool();
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [reservations] = await connection.execute(
        `SELECT product_id, quantity_reserved FROM inventory_reservations 
         WHERE order_id = ? AND status = 'active'`,
        [orderId]
      );
      
      if (reservations.length === 0) return 0;
      
      // Release stock for each reservation
      for (const reservation of reservations) {
        await Stock.releaseReservation(
          reservation.product_id,
          reservation.quantity_reserved,
          connection
        );
      }
      
      const [result] = await connection.execute(
        `UPDATE inventory_reservations 
         SET status = 'released' 
         WHERE order_id = ? AND status = 'active'`,
        [orderId]
      );
      
      await connection.commit();
      logger.info(`Released ${result.affectedRows} reservations for order ${orderId}`);
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      logger.error('Error releasing order reservations:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  static async extendExpiry(reservationId, additionalMinutes = 15) {
    const db = getPool();
    const [result] = await db.execute(
      `UPDATE inventory_reservations 
       SET expires_at = DATE_ADD(expires_at, INTERVAL ? MINUTE)
       WHERE id = ? AND status = 'active'`,
      [additionalMinutes, reservationId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Reservation;