@'
const app = require('./app');
const { connectEmail } = require('./config/email');
const { connectSMS } = require('./config/sms');
const { connectKafka } = require('./config/kafka');
const orderConsumer = require('./consumers/order.consumer');
const paymentConsumer = require('./consumers/payment.consumer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3006;
let server = null;

async function startServer() {
  try {
    // Connect to Email service
    await connectEmail();
    
    // Connect to SMS service
    await connectSMS();
    
    // Connect to Kafka (optional)
    try {
      await connectKafka();
      logger.info('✅ Kafka connected');
      
      // Start consumers
      await orderConsumer.start();
      await paymentConsumer.start();
      logger.info('✅ Consumers started');
    } catch (kafkaError) {
      logger.warn('⚠️ Kafka not available, running without events');
    }
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Notification Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📧 Email: ${process.env.ENABLE_EMAIL === 'true' ? 'enabled' : 'disabled'}`);
      logger.info(`💬 SMS: ${process.env.ENABLE_SMS === 'true' ? 'enabled' : 'disabled'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down...`);
      if (server) {
        server.close(() => {
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