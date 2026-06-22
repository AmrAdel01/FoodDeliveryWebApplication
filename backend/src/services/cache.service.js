import { createHash } from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { redisClient } from '../config/redis.js';

export const cacheKeys = Object.freeze({
  product: (id) => `products:detail:${id}`,
  productList: (query) => {
    const canonical = JSON.stringify(Object.fromEntries(Object.entries(query).sort(([a], [b]) => a.localeCompare(b))));
    return `products:list:${createHash('sha256').update(canonical).digest('hex').slice(0, 24)}`;
  },
  categories: () => 'products:categories',
  trending: (limit) => `products:trending:${limit}`,
  productsPattern: () => 'products:*',
});

class RedisCacheService {
  constructor(client, ttlSeconds) {
    this.client = client;
    this.ttlSeconds = ttlSeconds;
  }

  get enabled() {
    return Boolean(this.client?.isReady);
  }

  async get(key) {
    if (!this.enabled) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.warn({ err: error, cacheKey: key }, 'Cache read failed');
      return null;
    }
  }

  async set(key, value, ttlSeconds = this.ttlSeconds) {
    if (!this.enabled) return;
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
      logger.warn({ err: error, cacheKey: key }, 'Cache write failed');
    }
  }

  async remember(key, loader, ttlSeconds = this.ttlSeconds) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async deleteByPattern(pattern) {
    if (!this.enabled) return;
    try {
      for await (const entry of this.client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        const keys = Array.isArray(entry) ? entry : [entry];
        if (keys.length) await this.client.del(keys);
      }
    } catch (error) {
      logger.warn({ err: error, cachePattern: pattern }, 'Cache invalidation failed');
    }
  }
}

export const cacheService = new RedisCacheService(redisClient, env.cacheTtlSeconds);

export const invalidateProductCache = () => cacheService.deleteByPattern(cacheKeys.productsPattern());
