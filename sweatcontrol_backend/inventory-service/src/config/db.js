
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
      enableKeepAlive: true
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

async function transaction(callback) {
  const db = getPool();
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { connectDB, getPool, transaction };
