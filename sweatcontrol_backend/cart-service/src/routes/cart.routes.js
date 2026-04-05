
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const addToCartSchema = Joi.object({
  guestToken: Joi.string().optional(),
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(100).required()
});

const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required()
});

const clearCartSchema = Joi.object({
  guestToken: Joi.string().required()
});

// Routes
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/:id', validate(updateCartSchema), cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);
router.post('/clear', validate(clearCartSchema), cartController.clearCart);

module.exports = router;
