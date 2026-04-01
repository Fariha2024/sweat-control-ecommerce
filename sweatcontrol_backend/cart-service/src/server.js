@'
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await connectDB();
    logger.info('✅ MySQL database connected');
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Cart Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
    });
    
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
'@ | Out-File -FilePath src\server.js -Encoding utf8