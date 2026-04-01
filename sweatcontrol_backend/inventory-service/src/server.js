@'
const app = require('./app');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { connectKafka } = require('./config/kafka');
const orderConsumer = require('./consumers/order.consumer');
const releaseExpiredWorker = require('./services/workers/release-expired');
const syncStockWorker = require('./services/workers/sync-stock');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3004;
let server = null;

async function startServer() {
  try {
    // Connect to MySQL
    await connectDB();
    logger.info('✅ MySQL database connected');
    
    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis cache connected');
    
    // Connect to Kafka (optional)
    await connectKafka();
    
    // Start Kafka consumer
    await orderConsumer.start();
    
    // Start background workers
    releaseExpiredWorker.start();
    syncStockWorker.start();
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Inventory Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down...`);
      if (server) {
        server.close(async () => {
          const { getPool } = require('./config/db');
          const pool = getPool();
          if (pool) await pool.end();
          logger.info('Shutdown complete');
          process.exit(0);
        });
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
'@ | Out-File -FilePath src\server.js -Encoding utf8