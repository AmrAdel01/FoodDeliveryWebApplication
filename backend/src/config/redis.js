import { createClient } from 'redis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redisClient = env.redisUrl
  ? createClient({
    url: env.redisUrl,
    socket: { reconnectStrategy: (retries) => Math.min(retries * 100, 3000) },
  })
  : null;

redisClient?.on('error', (error) => logger.error({ err: error }, 'Redis client error'));
redisClient?.on('reconnecting', () => logger.warn('Redis reconnecting'));

export async function connectRedis() {
  if (!redisClient || redisClient.isOpen) return;
  await redisClient.connect();
  logger.info('Redis connected');
}

export async function disconnectRedis() {
  if (redisClient?.isOpen) await redisClient.close();
}
