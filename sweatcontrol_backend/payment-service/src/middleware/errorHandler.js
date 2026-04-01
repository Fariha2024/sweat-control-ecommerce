const { error } = require('../utils/response');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    body: req.body,
    query: req.query
  });
  
  // Handle known error types
  if (err.name === 'ValidationError' || err.type === 'ValidationError') {
    return error(res, err.message, 400);
  }
  
  if (err.name === 'NotFoundError' || err.type === 'NotFoundError') {
    return error(res, err.message, 404);
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'Duplicate entry detected', 409);
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return error(res, 'Referenced record not found', 400);
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  return error(res, message, statusCode);
}

module.exports = errorHandler;