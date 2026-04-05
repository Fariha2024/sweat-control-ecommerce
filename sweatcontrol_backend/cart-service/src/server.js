
// Load .env FIRST - before anything else
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('1. Starting server initialization...');

const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3002;

console.log('2. PORT set to:', PORT);

async function startServer() {
  console.log('3. Inside startServer function...');
  try {
    console.log('4. Connecting to database...');
    await connectDB();
    logger.info('✅ MySQL database connected');
    console.log('5. Database connected successfully');

    console.log('6. Starting HTTP server on port', PORT);
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('7. Server callback executed');
      logger.info(`🚀 Cart Service running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
    });
    
    console.log('8. Server listen called, waiting for callback...');
    
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('ERROR:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

console.log('9. Calling startServer...');
startServer();
console.log('10. startServer called (async)');
