import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.logLevel,
  base: { service: 'food-ordering-api', environment: env.nodeEnv },
  redact: {
    paths: ['req.headers.authorization', 'password', '*.password', 'apiSecret'],
    censor: '[REDACTED]',
  },
});
