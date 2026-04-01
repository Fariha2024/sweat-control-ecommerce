const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const Joi = require('joi');

// Validation schemas
const productIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const stockCheckSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required()
});

const searchSchema = Joi.object({
  q: Joi.string().min(2).max(100).required()
});

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', validate(searchSchema, 'query'), productController.searchProducts);
router.get('/check-stock', validate(stockCheckSchema, 'query'), productController.checkStock);
router.get('/:id', validate(productIdSchema, 'params'), productController.getProductById);

// Protected routes (admin only - future)
// router.post('/', authenticate, validate(productCreateSchema), productController.createProduct);
// router.put('/:id', authenticate, productController.updateProduct);
// router.delete('/:id', authenticate, productController.deleteProduct);

module.exports = router;