const app = require('./app');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

let server = null;

async function startServer() {
  try {
    // Connect to MySQL
    await connectDB();
    logger.info('✅ MySQL database connected');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis cache connected');

    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Product Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          
          // Close database connections
          const { getPool } = require('./config/db');
          const pool = getPool();
          if (pool) {
            await pool.end();
            logger.info('MySQL connections closed');
          }
          
          logger.info('Product Service shutdown complete');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();