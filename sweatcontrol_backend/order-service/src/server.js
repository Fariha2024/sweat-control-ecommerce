# Navigate to order-service
cd C:\Users\muham\sweat-control-ecommerce\sweatcontrol_backend\order-service

# Create server.js
@'
const app = require('./app');
const { connectDB } = require('./config/db');
const { connectKafka } = require('./config/kafka');
const paymentConsumer = require('./consumers/payment.consumer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3003;
let server = null;

async function startServer() {
  try {
    // Connect to MySQL
    await connectDB();
    logger.info('✅ MySQL database connected');
    
    // Connect to Kafka (optional - won't fail if not available)
    try {
      await connectKafka();
      logger.info('✅ Kafka connected');
      
      // Start payment consumer only if Kafka is available
      await paymentConsumer.start();
      logger.info('✅ Payment consumer started');
    } catch (kafkaError) {
      logger.warn('⚠️ Kafka not available, running without event bus');
    }
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Order Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed');
          
          const { getPool } = require('./config/db');
          const pool = getPool();
          if (pool) {
            await pool.end();
            logger.info('MySQL connections closed');
          }
          
          logger.info('Order Service shutdown complete');
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

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
'@ | Out-File -FilePath src\server.js -Encoding utf8