const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the root of the service
dotenv.config({ path: path.join(__dirname, '../../.env') });

const logger = require('../utils/logger');

let pool = null;

async function connectDB() {
  try {
    // Debug: Check if env variables are loaded
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    logger.info(`✅ MySQL connected to ${process.env.DB_NAME}`);
    return pool;

  } catch (error) {
    logger.error('❌ MySQL connection failed:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}

module.exports = { connectDB, getPool };
