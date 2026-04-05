
const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream for morgan to use winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Skip logging for health checks in production
const skip = () => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return false;
};

// Build morgan middleware
const requestLogger = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  { stream, skip }
);

module.exports = requestLogger;
