
const Cart = require('../models/Cart');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class CartService {
  async getOrCreateGuestToken(token) {
    if (token) {
      return token;
    }
    return uuidv4();
  }
  
  async validateProduct(productId, quantity) {
    try {
      const response = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/check-stock?productId=${productId}&quantity=${quantity}`
      );
      
      if (response.data.success) {
        return {
          valid: true,
          price: response.data.data.price || 0,
          stock: response.data.data.stock
        };
      }
      return { valid: false, error: 'Product validation failed' };
      
    } catch (error) {
      logger.error('Product validation error:', error.message);
      throw new ValidationError('Product service unavailable');
    }
  }
  
  async addToCart(guestToken, productId, quantity) {
    if (!guestToken) {
      guestToken = await this.getOrCreateGuestToken(null);
    }
    
    // Validate product
    const product = await this.validateProduct(productId, quantity);
    if (!product.valid) {
      throw new ValidationError('Invalid product or insufficient stock');
    }
    
    // Add to cart
    const cart = await Cart.addItem(guestToken, productId, quantity, product.price);
    
    return {
      guestToken,
      cart,
      total: await Cart.getCartTotal(guestToken)
    };
  }
  
  async getCart(guestToken) {
    if (!guestToken) {
      throw new ValidationError('Guest token required');
    }
    
    const cartItems = await Cart.findByGuestToken(guestToken);
    
    // Fetch product details for each item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const response = await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`
          );
          return {
            ...item,
            product: response.data.data
          };
        } catch (error) {
          return item;
        }
      })
    );
    
    return {
      guestToken,
      items: itemsWithDetails,
      total: await Cart.getCartTotal(guestToken),
      itemCount: cartItems.length
    };
  }
  
  async updateCartItem(cartId, quantity) {
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }
    
    const item = await Cart.updateQuantity(cartId, quantity);
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }
    
    return item;
  }
  
  async removeCartItem(cartId) {
    await Cart.removeItem(cartId);
    return { success: true };
  }
  
  async clearCart(guestToken) {
    await Cart.clearCart(guestToken);
    return { success: true };
  }
}

module.exports = new CartService();
