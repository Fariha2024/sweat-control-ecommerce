
/**
 * Shared Winston Logger Configuration
 * Used across all microservices for consistent logging
 */

const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, service, ...meta }) => {
    const serviceTag = service ? `[${service}] ` : '';
    return `${timestamp} ${serviceTag}[${level.toUpperCase()}]: ${message} ${stack || ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

function createLogger(serviceName) {
  const logDir = path.join(process.cwd(), 'logs');
  
  // Ensure logs directory exists (will be created by each service)
  const fs = require('fs');
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {
      // Ignore if can't create - will use console only
    }
  }

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    ]
  });

  return logger;
}

module.exports = { createLogger };
