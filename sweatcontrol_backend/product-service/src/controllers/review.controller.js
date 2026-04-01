const reviewService = require('../services/review.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class ReviewController {
  async addReview(req, res, next) {
    try {
      const { product_id, reviewer_name, email, rating, comment, phone_number } = req.body;
      
      const review = await reviewService.addReview({
        product_id,
        reviewer_name,
        email,
        rating,
        comment,
        phone_number
      });
      
      logger.info(`New review for product ${product_id}`);
      return success(res, review, 'Review submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }
  
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const reviews = await reviewService.getProductReviews(productId, page, limit);
      return success(res, reviews, 'Reviews fetched successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async getReviewStats(req, res, next) {
    try {
      const { productId } = req.params;
      const stats = await reviewService.getReviewStats(productId);
      return success(res, stats, 'Review stats fetched successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReviewController();