import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { connectDatabase, disconnectDatabase } from './database/connect.js';

let server;

async function start() {
  await connectDatabase();
  await connectRedis();
  server = app.listen(env.port, env.host, () => logger.info({ host: env.host, port: env.port }, 'API listening'));
}

async function shutdown(signal, exitCode = 0) {
  logger.info({ signal }, 'Shutting down');
  const forceExit = setTimeout(() => {
    logger.fatal('Graceful shutdown timed out');
    process.exit(1);
  }, 10000).unref();

  if (server) await new Promise((resolve) => server.close(resolve));
  await Promise.allSettled([disconnectRedis(), disconnectDatabase()]);
  clearTimeout(forceExit);
  process.exit(exitCode);
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => {
  logger.fatal({ err: error }, 'Unhandled rejection');
  void shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  void shutdown('uncaughtException', 1);
});

start().catch((error) => {
  logger.fatal({ err: error }, 'Startup failed');
  process.exit(1);
});
