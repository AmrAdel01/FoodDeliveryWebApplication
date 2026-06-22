import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import helmet from 'helmet';
import hpp from 'hpp';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { redisClient } from './config/redis.js';
import { errorHandler, notFound } from './middlewares/errors.js';
import { sanitizeRequest } from './middlewares/sanitize.js';
import routes from './routes/index.js';
import { sendSuccess } from './utils/response.js';

export const app = express();

const rateLimitStore = redisClient
  ? new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })
  : undefined;

app.set('trust proxy', env.nodeEnv === 'production' ? 1 : false);
app.disable('x-powered-by');
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.method === 'OPTIONS' || req.url === '/api/health',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl.split(',').map((item) => item.trim()), credentials: true }));
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(sanitizeRequest);
app.use(hpp());
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  store: rateLimitStore,
}));
app.get('/api/health', (_req, res) => sendSuccess(res, {
  message: 'API is healthy',
  data: { uptime: process.uptime() },
}));
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);
