const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const createReviewSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  reviewer_name: Joi.string().max(100).optional(),
  email: Joi.string().email().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).required(),
  phone_number: Joi.string().max(20).optional()
});

const productIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional()
});

// Routes
router.post('/', validate(createReviewSchema), reviewController.addReview);
router.get('/product/:productId', 
  validate(productIdParamSchema, 'params'),
  validate(paginationSchema, 'query'),
  reviewController.getProductReviews
);
router.get('/product/:productId/stats', 
  validate(productIdParamSchema, 'params'),
  reviewController.getReviewStats
);

module.exports = router;