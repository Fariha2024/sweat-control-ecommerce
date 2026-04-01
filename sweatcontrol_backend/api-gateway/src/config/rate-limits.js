module.exports = {
  // Global limits
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  
  // Service-specific limits
  services: {
    product: {
      windowMs: 15 * 60 * 1000,
      max: 200,
    },
    cart: {
      windowMs: 15 * 60 * 1000,
      max: 150,
    },
    order: {
      windowMs: 15 * 60 * 1000,
      max: 50,
    },
    payment: {
      windowMs: 15 * 60 * 1000,
      max: 20, // Lower limit for payments
    },
    review: {
      windowMs: 15 * 60 * 1000,
      max: 30,
    },
  },
  
  // Auth endpoints
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
  },
};