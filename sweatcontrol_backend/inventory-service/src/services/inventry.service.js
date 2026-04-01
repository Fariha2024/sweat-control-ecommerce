@'
const Stock = require('../models/Stock');
const Reservation = require('../models/Reservation');
const { transaction } = require('../config/db');
const { sendEvent } = require('../config/kafka');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class InventoryService {
  async getStock(productId) {
    const stock = await Stock.getStock(productId);
    if (!stock) {
      throw new NotFoundError(`Product ${productId} not found in inventory`);
    }
    
    return {
      productId: stock.product_id,
      quantity: stock.quantity,
      reserved: stock.reserved_quantity,
      available: stock.available_quantity,
      lowStockThreshold: stock.low_stock_threshold,
      isLowStock: stock.available_quantity <= stock.low_stock_threshold
    };
  }
  
  async checkStock(productId, quantity) {
    const result = await Stock.checkAvailability(productId, quantity);
    
    if (!result.available) {
      throw new ValidationError(result.reason || 'Insufficient stock');
    }
    
    return result;
  }
  
  async reserveStock(orderId, items) {
    return await transaction(async (connection) => {
      // Check and reserve each item
      for (const item of items) {
        const check = await Stock.checkAvailability(item.product_id, item.quantity);
        if (!check.available) {
          throw new ValidationError(`Insufficient stock for product ${item.product_id}`);
        }
        
        await Stock.reserveStock(item.product_id, item.quantity, connection);
      }
      
      // Create reservation records
      const reservations = await Reservation.create(orderId, items);
      
      // Send event
      await sendEvent('inventory.reserved', {
        type: 'INVENTORY_RESERVED',
        orderId,
        items,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        reservations,
        message: `Reserved ${items.length} items for order ${orderId}`
      };
    });
  }
  
  async confirmReservation(orderId) {
    return await transaction(async (connection) => {
      const reservations = await Reservation.findByOrderId(orderId);
      
      if (reservations.length === 0) {
        throw new NotFoundError(`No active reservations found for order ${orderId}`);
      }
      
      for (const reservation of reservations) {
        await Stock.confirmReservation(
          reservation.product_id,
          reservation.quantity_reserved,
          connection
        );
      }
      
      const converted = await Reservation.convertToSale(orderId);
      
      await sendEvent('inventory.confirmed', {
        type: 'INVENTORY_CONFIRMED',
        orderId,
        items: reservations,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        confirmed: converted,
        message: `Confirmed ${converted} reservations for order ${orderId}`
      };
    });
  }
  
  async releaseReservation(orderId) {
    const reservations = await Reservation.findByOrderId(orderId);
    
    if (reservations.length === 0) {
      return { success: true, message: 'No active reservations found' };
    }
    
    return await transaction(async (connection) => {
      for (const reservation of reservations) {
        await Stock.releaseReservation(
          reservation.product_id,
          reservation.quantity_reserved,
          connection
        );
      }
      
      const released = await Reservation.releaseOrderReservations(orderId);
      
      await sendEvent('inventory.released', {
        type: 'INVENTORY_RELEASED',
        orderId,
        items: reservations,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        released,
        message: `Released ${released} reservations for order ${orderId}`
      };
    });
  }
  
  async updateStock(productId, newQuantity, reason) {
    const result = await Stock.updateStock(productId, newQuantity, reason);
    
    if (!result.success) {
      throw new NotFoundError(`Product ${productId} not found`);
    }
    
    await sendEvent('inventory.updated', {
      type: 'INVENTORY_UPDATED',
      productId,
      newQuantity,
      reason,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      productId,
      newQuantity,
      message: 'Stock updated successfully'
    };
  }
  
  async getLowStockProducts(threshold = 10) {
    const db = require('../config/db').getPool();
    const [rows] = await db.execute(
      `SELECT product_id, quantity, reserved_quantity, available_quantity 
       FROM stock 
       WHERE available_quantity <= ?`,
      [threshold]
    );
    
    return rows;
  }
}

module.exports = new InventoryService();
'@ | Out-File -FilePath src\services\inventory.service.js -Encoding utf8