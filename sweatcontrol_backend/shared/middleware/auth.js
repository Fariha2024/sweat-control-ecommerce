@'
/**
 * Shared Authentication Middleware
 * Used across all microservices for API authentication
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// Service-to-service API key authentication
function authenticateService(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY || process.env.INTERNAL_API_KEY;
  
  if (!apiKey) {
    return next(new UnauthorizedError('API key required'));
  }
  
  if (apiKey !== expectedKey) {
    return next(new ForbiddenError('Invalid API key'));
  }
  
  next();
}

// JWT authentication for users
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Allow guest access for public routes
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    return next(new UnauthorizedError('Invalid token'));
  }
}

// Role-based access control
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Requires one of these roles: ${roles.join(', ')}`));
    }
    
    next();
  };
}

// Admin only middleware
const requireAdmin = requireRole('admin');

// Optional authentication (continue even if no token)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Invalid token - continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
}

// Rate limiting by user (simple in-memory store)
const requestCounts = new Map();

function rateLimitByUser(maxRequests = 100, windowMs = 900000) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const userRequests = requestCounts.get(key) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`
      });
    }
    
    validRequests.push(now);
    requestCounts.set(key, validRequests);
    
    // Clean up old entries periodically
    if (requestCounts.size > 10000) {
      for (const [k, times] of requestCounts) {
        if (times.length === 0 || Date.now() - times[times.length - 1] > windowMs * 2) {
          requestCounts.delete(k);
        }
      }
    }
    
    next();
  };
}

module.exports = {
  authenticateService,
  authenticateUser,
  requireRole,
  requireAdmin,
  optionalAuth,
  rateLimitByUser
};
'@ | Out-File -FilePath middleware\auth.js -Encoding utf8