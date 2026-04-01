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
    logger.warn('⚠️ Redis connection failed, running without session store:', error.message);
    return null;
  }
}

function getRedis() {
  return redisClient;
}

async function setSession(guestToken, cartData, ttlSeconds = 604800) {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(`cart:${guestToken}`, ttlSeconds, JSON.stringify(cartData));
    return true;
  } catch (error) {
    logger.error('Redis set session error:', error);
    return false;
  }
}

async function getSession(guestToken) {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(`cart:${guestToken}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get session error:', error);
    return null;
  }
}

async function deleteSession(guestToken) {
  if (!redisClient) return;
  try {
    await redisClient.del(`cart:${guestToken}`);
    logger.debug(`Session deleted for ${guestToken}`);
  } catch (error) {
    logger.error('Redis delete session error:', error);
  }
}

async function invalidateCartCache(guestToken) {
  await deleteSession(guestToken);
}

module.exports = { 
  connectRedis, 
  getRedis, 
  setSession, 
  getSession, 
  deleteSession,
  invalidateCartCache 
};
'@ | Out-File -FilePath src\config\redis.js -Encoding utf8