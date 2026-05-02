import Redis from 'ioredis';
import { CircuitBreaker } from '../utils/circuitBreaker.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 2) return null; // stop retrying
    return 1000;
  }
});

let isConnected = false;
const memoryCache = new Map();
const memoryLocks = new Set();

const redisBreaker = new CircuitBreaker('Redis', {
  failureThreshold: 3,
  resetTimeout: 30000,
  fallback: () => {
    isConnected = false;
    return null;
  }
});

redis.connect().then(() => {
  isConnected = true;
  console.log('✅ Redis connected successfully.');
}).catch((err) => {
  console.warn('⚠️ Redis connection failed. Falling back to in-memory mode.', err.message);
});

export const setCache = async (key, value, ttlSeconds = 60) => {
  if (isConnected && redisBreaker.state !== 'OPEN') {
    try {
      await redisBreaker.fire(() => redis.set(key, JSON.stringify(value), 'EX', ttlSeconds));
      return;
    } catch (e) {
      isConnected = false;
    }
  }
  memoryCache.set(key, { value, exp: Date.now() + ttlSeconds * 1000 });
};

export const getCache = async (key) => {
  if (isConnected && redisBreaker.state !== 'OPEN') {
    try {
      const data = await redisBreaker.fire(() => redis.get(key));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      isConnected = false;
    }
  }
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.exp) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
};

export const deleteCachePattern = async (pattern) => {
  if (isConnected && redisBreaker.state !== 'OPEN') {
    try {
      await redisBreaker.fire(async () => {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) await redis.del(...keys);
      });
      return;
    } catch (e) {
      isConnected = false;
    }
  }
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) memoryCache.delete(key);
  }
};

export const acquireLock = async (key, ttlSeconds = 5) => {
  if (isConnected && redisBreaker.state !== 'OPEN') {
    try {
      return await redisBreaker.fire(async () => {
        const result = await redis.setnx(`lock:${key}`, '1');
        if (result) {
          await redis.expire(`lock:${key}`, ttlSeconds);
          return true;
        }
        return false;
      });
    } catch (e) {
      isConnected = false;
    }
  }
  if (memoryLocks.has(key)) return false;
  memoryLocks.add(key);
  setTimeout(() => memoryLocks.delete(key), ttlSeconds * 1000);
  return true;
};

export const releaseLock = async (key) => {
  if (isConnected && redisBreaker.state !== 'OPEN') {
    try {
      await redisBreaker.fire(() => redis.del(`lock:${key}`));
      return;
    } catch (e) {
      isConnected = false;
    }
  }
  memoryLocks.delete(key);
};

export default redis;
