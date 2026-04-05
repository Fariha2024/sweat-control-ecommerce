
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const { connectDB } = require('./config/db');
const { connectKafka } = require('./config/kafka');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3005;

async function startServer() {
  try {
    await connectDB();
    logger.info('✅ MySQL database connected');
    
    try {
      await connectKafka();
      logger.info('✅ Kafka connected');
    } catch (kafkaError) {
      logger.warn('⚠️ Kafka not available');
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Payment Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down...');
      server.close(() => process.exit(0));
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
