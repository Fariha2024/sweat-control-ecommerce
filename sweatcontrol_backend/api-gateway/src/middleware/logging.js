const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  logger.debug(`→ ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`← ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
}

function errorLogger(err, req, res, next) {
  logger.error(`Error processing ${req.method} ${req.url}:`, {
    error: err.message,
    stack: err.stack,
    statusCode: err.status || 500
  });
  next(err);
}

module.exports = { requestLogger, errorLogger };