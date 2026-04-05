
const inventoryService = require('../services/inventory.service');
const reservationService = require('../services/reservation.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class InventoryController {
  async getStock(req, res, next) {
    try {
      const { productId } = req.params;
      const stock = await inventoryService.getStock(parseInt(productId));
      return success(res, stock, 'Stock retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async checkStock(req, res, next) {
    try {
      const { productId, quantity } = req.query;
      const result = await inventoryService.checkStock(parseInt(productId), parseInt(quantity));
      return success(res, result, 'Stock check completed');
    } catch (err) {
      next(err);
    }
  }
  
  async reserveStock(req, res, next) {
    try {
      const { orderId, items } = req.body;
      const result = await inventoryService.reserveStock(orderId, items);
      return success(res, result, 'Stock reserved successfully', 201);
    } catch (err) {
      next(err);
    }
  }
  
  async confirmReservation(req, res, next) {
    try {
      const { orderId } = req.body;
      const result = await inventoryService.confirmReservation(orderId);
      return success(res, result, 'Reservation confirmed');
    } catch (err) {
      next(err);
    }
  }
  
  async releaseReservation(req, res, next) {
    try {
      const { orderId } = req.body;
      const result = await inventoryService.releaseReservation(orderId);
      return success(res, result, 'Reservation released');
    } catch (err) {
      next(err);
    }
  }
  
  async updateStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity, reason } = req.body;
      const result = await inventoryService.updateStock(parseInt(productId), quantity, reason);
      return success(res, result, 'Stock updated');
    } catch (err) {
      next(err);
    }
  }
  
  async getLowStock(req, res, next) {
    try {
      const { threshold } = req.query;
      const products = await inventoryService.getLowStockProducts(parseInt(threshold) || 10);
      return success(res, products, 'Low stock products retrieved');
    } catch (err) {
      next(err);
    }
  }
  
  async getReservationStats(req, res, next) {
    try {
      const stats = await reservationService.getReservationStats();
      return success(res, stats, 'Reservation stats retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryController();
