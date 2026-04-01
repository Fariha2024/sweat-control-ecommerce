@'
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const createOrderSchema = Joi.object({
  guestToken: Joi.string().uuid().required(),
  customer: Joi.object({
    first_name: Joi.string().max(100).optional(),
    last_name: Joi.string().max(100).optional(),
    country_code: Joi.string().max(5).required(),
    phone_number: Joi.string().max(20).required(),
    email: Joi.string().email().required(),
    address_line1: Joi.string().required(),
    address_line2: Joi.string().optional(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    zip_code: Joi.string().max(20).required(),
    notes: Joi.string().optional()
  }).required()
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).optional()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending', 'payment_processing', 'paid', 'confirmed',
    'packed', 'shipped', 'delivered', 'cancelled', 'refunded'
  ).required(),
  reason: Joi.string().max(500).optional()
});

const trackOrderSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required()
});

// Routes
router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/:id', orderController.getOrder);
router.get('/', orderController.getOrdersByGuestToken);
router.post('/:id/cancel', validate(cancelOrderSchema), orderController.cancelOrder);
router.get('/:id/track', validate(trackOrderSchema, 'query'), orderController.trackOrder);
router.put('/:id/status', validate(updateStatusSchema), orderController.updateOrderStatus);

module.exports = router;
'@ | Out-File -FilePath src\routes\order.routes.js -Encoding utf8