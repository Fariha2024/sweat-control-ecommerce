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

async function setCache(key, value, ttlSeconds = 300) {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
}

async function getCache(key) {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

async function invalidateCache(pattern) {
  if (!redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Redis invalidation error:', error);
  }
}

module.exports = { connectRedis, getRedis, setCache, getCache, invalidateCache };