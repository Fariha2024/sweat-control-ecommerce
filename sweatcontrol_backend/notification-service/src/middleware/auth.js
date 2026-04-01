const { error } = require('../utils/response');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
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

function requireAdmin(req, res, next) {
  // This would check JWT tokens for admin role
  // Simplified for now
  const adminToken = req.headers['x-admin-token'];
  
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return error(res, 'Admin access required', 403);
  }
  
  next();
}

module.exports = { authenticate, requireAdmin };