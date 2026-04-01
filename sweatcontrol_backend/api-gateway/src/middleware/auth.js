const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify JWT token (for future authenticated routes)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Allow guest access for public routes
    req.user = null;
    return next();
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Verify API key for service-to-service communication
function authenticateService(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_GATEWAY_KEY;
  
  if (!apiKey || apiKey !== expectedKey) {
    logger.warn('Invalid service API key from:', req.ip);
    return res.status(401).json({ error: 'Invalid service credentials' });
  }
  
  next();
}

// Rate limiting per user/IP
function rateLimitByUser(limit = 100, windowMs = 900000) {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const userRequests = requests.get(key) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    next();
  };
}

module.exports = { authenticateToken, authenticateService, rateLimitByUser };