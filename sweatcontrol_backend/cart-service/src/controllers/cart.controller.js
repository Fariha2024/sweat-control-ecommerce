@'
const cartService = require('../services/cart.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class CartController {
  async addToCart(req, res, next) {
    try {
      const { guestToken, productId, quantity } = req.body;
      
      if (!productId || !quantity) {
        return error(res, 'productId and quantity are required', 400);
      }
      
      const result = await cartService.addToCart(guestToken, productId, quantity);
      
      return success(res, result, 'Item added to cart', 201);
    } catch (err) {
      next(err);
    }
  }
  
  async getCart(req, res, next) {
    try {
      const { guestToken } = req.query;
      
      if (!guestToken) {
        return error(res, 'guestToken is required', 400);
      }
      
      const cart = await cartService.getCart(guestToken);
      
      return success(res, cart, 'Cart retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async updateCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      const item = await cartService.updateCartItem(parseInt(id), quantity);
      
      return success(res, item, 'Cart item updated');
    } catch (err) {
      next(err);
    }
  }
  
  async removeCartItem(req, res, next) {
    try {
      const { id } = req.params;
      
      await cartService.removeCartItem(parseInt(id));
      
      return success(res, null, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  }
  
  async clearCart(req, res, next) {
    try {
      const { guestToken } = req.body;
      
      if (!guestToken) {
        return error(res, 'guestToken is required', 400);
      }
      
      await cartService.clearCart(guestToken);
      
      return success(res, null, 'Cart cleared successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CartController();
'@ | Out-File -FilePath src\controllers\cart.controller.js -Encoding utf8