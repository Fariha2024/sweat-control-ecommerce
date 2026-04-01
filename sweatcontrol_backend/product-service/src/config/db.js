const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool = null;

async function connectDB() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      acquireTimeout: 60000,
      timeout: 60000,
    });

    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    logger.info(`✅ MySQL connected to ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
    return pool;

  } catch (error) {
    logger.error('❌ MySQL connection failed:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    logger.info('MySQL pool closed');
  }
}

module.exports = { connectDB, getPool, closePool };