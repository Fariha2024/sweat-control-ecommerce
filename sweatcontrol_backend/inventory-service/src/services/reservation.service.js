@'
const Reservation = require('../models/Reservation');
const Stock = require('../models/Stock');
const { transaction } = require('../config/db');
const { sendEvent } = require('../config/kafka');
const logger = require('../utils/logger');

class ReservationService {
  async releaseExpiredReservations() {
    const released = await Reservation.releaseExpired();
    
    if (released > 0) {
      // Get expired reservations to release stock
      const db = require('../config/db').getPool();
      const [expired] = await db.execute(
        `SELECT product_id, quantity_reserved 
         FROM inventory_reservations 
         WHERE status = 'released' 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [released]
      );
      
      for (const item of expired) {
        await Stock.releaseReservation(item.product_id, item.quantity_reserved);
      }
      
      await sendEvent('inventory.reservations.expired', {
        type: 'RESERVATIONS_EXPIRED',
        count: released,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Released ${released} expired reservations and restored stock`);
    }
    
    return { released };
  }
  
  async getActiveReservations(orderId) {
    const reservations = await Reservation.findByOrderId(orderId);
    return reservations;
  }
  
  async getReservationStats() {
    const db = require('../config/db').getPool();
    
    const [active] = await db.execute(
      'SELECT COUNT(*) as count FROM inventory_reservations WHERE status = "active"'
    );
    
    const [expired] = await db.execute(
      'SELECT COUNT(*) as count FROM inventory_reservations WHERE status = "released"'
    );
    
    const [converted] = await db.execute(
      'SELECT COUNT(*) as count FROM inventory_reservations WHERE status = "converted"'
    );
    
    return {
      active: active[0].count,
      expired: expired[0].count,
      converted: converted[0].count
    };
  }
}

module.exports = new ReservationService();
'@ | Out-File -FilePath src\services\reservation.service.js -Encoding utf8