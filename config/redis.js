/**
 * Redis Configuration
 * Initializes redis client for OTP storage and caching
 */

const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis reconnection failed after 10 attempts');
        return new Error('Redis max reconnect attempts exceeded');
      }
      return retries * 100;
    },
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

/**
 * Connect to Redis
 */
const connect = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
};

/**
 * Set a key-value pair with expiry
 */
const setWithExpiry = async (key, value, expiry = 300) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.setEx(key, expiry, stringValue);
    return true;
  } catch (error) {
    console.error('Redis setWithExpiry error:', error);
    throw error;
  }
};

/**
 * Get a value from Redis
 */
const get = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Redis get error:', error);
    throw error;
  }
};

/**
 * Delete a key from Redis
 */
const del = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis del error:', error);
    throw error;
  }
};

/**
 * Check if key exists in Redis
 */
const exists = async (key) => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis exists error:', error);
    throw error;
  }
};

module.exports = {
  redisClient,
  connect,
  setWithExpiry,
  get,
  del,
  exists,
};
