
const { error } = require('../utils/response');
const logger = require('../utils/logger');

// Verify API key for service-to-service communication
function authenticateService(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  
  if (!apiKey) {
    logger.warn('Missing API key in request');
    return error(res, 'Authentication required', 401);
  }
  
  if (apiKey !== expectedKey) {
    logger.warn(`Invalid API key attempt from ${req.ip}`);
    return error(res, 'Invalid API key', 403);
  }
  
  next();
}

// Verify JWT token for user authentication (future)
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Allow guest access
    req.user = null;
    return next();
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token:', err.message);
    return error(res, 'Invalid or expired token', 401);
  }
}

// Admin only access
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, 'Admin access required', 403);
  }
  next();
}

module.exports = { authenticateService, authenticateUser, requireAdmin };
