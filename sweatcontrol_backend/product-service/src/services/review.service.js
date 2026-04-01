const Review = require('../models/Review');
const Product = require('../models/Product');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { invalidateCache } = require('../config/redis');
const logger = require('../utils/logger');

class ReviewService {
  async addReview(reviewData) {
    const { product_id, reviewer_name, email, rating, comment, phone_number } = reviewData;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }
    
    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${product_id} not found`);
    }
    
    // Check for duplicate review (same product and email)
    const isDuplicate = await Review.checkDuplicate(product_id, email);
    if (isDuplicate) {
      throw new ValidationError('You have already reviewed this product');
    }
    
    // Create review
    const review = await Review.create({
      product_id,
      reviewer_name: reviewer_name || 'Anonymous',
      email,
      rating,
      comment,
      phone_number
    });
    
    // Invalidate product cache to refresh review stats
    await invalidateCache(`product:${product_id}`);
    
    logger.info(`New review added for product ${product_id} by ${email}`);
    
    return {
      id: review.id,
      product_id: review.product_id,
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at
    };
  }
  
  async getProductReviews(productId, page = 1, limit = 10) {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    
    const result = await Review.findByProductId(productId, page, limit);
    
    return result;
  }
  
  async getReviewStats(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    
    const stats = await Review.getReviewStats(productId);
    
    return stats;
  }
}

module.exports = new ReviewService();