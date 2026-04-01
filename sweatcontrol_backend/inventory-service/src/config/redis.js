@'
const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

async function connectRedis() {
  try {
    const url = process.env.REDIS_URL || 
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    
    redisClient = Redis.createClient({ url });
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('✅ Redis connected');
    });
    
    await redisClient.connect();
    return redisClient;
    
  } catch (error) {
    logger.warn('⚠️ Redis connection failed, running without cache:', error.message);
    return null;
  }
}

function getRedis() {
  return redisClient;
}

async function getStockCache(productId) {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(`stock:${productId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

async function setStockCache(productId, stockData, ttlSeconds = 60) {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(`stock:${productId}`, ttlSeconds, JSON.stringify(stockData));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
}

async function invalidateStockCache(productId) {
  if (!redisClient) return;
  try {
    await redisClient.del(`stock:${productId}`);
    logger.debug(`Stock cache invalidated for product ${productId}`);
  } catch (error) {
    logger.error('Redis invalidation error:', error);
  }
}

module.exports = { connectRedis, getRedis, getStockCache, setStockCache, invalidateStockCache };
'@ | Out-File -FilePath src\config\redis.js -Encoding utf8