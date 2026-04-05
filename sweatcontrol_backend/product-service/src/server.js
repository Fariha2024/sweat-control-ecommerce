const dotenv = require('dotenv');
const path = require('path');

// Load .env at the very beginning
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;
let server = null;

async function startServer() {
  try {
    // Debug
    console.log('PORT from env:', process.env.PORT);
    console.log('DB_HOST from env:', process.env.DB_HOST);

    await connectDB();
    logger.info('✅ MySQL database connected');

    await connectRedis();
    logger.info('✅ Redis cache connected');

    server = app.listen(PORT, () => {
      logger.info(`🚀 Product Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      if (server) {
        server.close(async () => {
          const { getPool } = require('./config/db');
          const pool = getPool();
          if (pool) await pool.end();
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

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
