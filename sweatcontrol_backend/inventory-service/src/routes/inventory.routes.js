@'
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const checkStockSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required()
});

const reserveStockSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
  items: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required()
  })).min(1).required()
});

const confirmReleaseSchema = Joi.object({
  orderId: Joi.number().integer().positive().required()
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  reason: Joi.string().max(500).optional()
});

// Routes
router.get('/:productId', inventoryController.getStock);
router.get('/check', validate(checkStockSchema, 'query'), inventoryController.checkStock);
router.post('/reserve', validate(reserveStockSchema), inventoryController.reserveStock);
router.post('/confirm', validate(confirmReleaseSchema), inventoryController.confirmReservation);
router.post('/release', validate(confirmReleaseSchema), inventoryController.releaseReservation);
router.put('/:productId', validate(updateStockSchema), inventoryController.updateStock);
router.get('/low-stock/list', inventoryController.getLowStock);
router.get('/stats/reservations', inventoryController.getReservationStats);

module.exports = router;
'@ | Out-File -FilePath src\routes\inventory.routes.js -Encoding utf8