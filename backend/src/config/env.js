import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
const productionRequired = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'REDIS_URL',
];

export function validateEnv() {
  const keys = process.env.NODE_ENV === 'production'
    ? [...required, ...productionRequired]
    : required;
  const missing = keys.filter((key) => !process.env[key]?.trim());
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (process.env.NODE_ENV === 'production' && cloudName && !/^[A-Za-z0-9_-]+$/.test(cloudName)) {
    throw new Error('CLOUDINARY_CLOUD_NAME must be the Cloudinary dashboard cloud name (letters, numbers, underscores, and hyphens only)');
  }
}

validateEnv();

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL || '',
  cacheTtlSeconds: Math.max(Number(process.env.CACHE_TTL_SECONDS) || 300, 1),
  cloudinary: Object.freeze({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
    apiKey: process.env.CLOUDINARY_API_KEY?.trim() || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || '',
    folder: process.env.CLOUDINARY_FOLDER?.trim() || 'food-ordering/products',
  }),
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
});
