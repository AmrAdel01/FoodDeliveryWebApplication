import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  mongoose.set('autoIndex', env.nodeEnv !== 'production');
  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 20,
    minPoolSize: env.nodeEnv === 'production' ? 2 : 0,
    serverSelectionTimeoutMS: 5000,
  });
  logger.info('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
