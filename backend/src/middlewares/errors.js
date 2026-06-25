import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import multer from 'multer';

function duplicateKeyError(error) {
  const key = Object.keys(error.keyPattern || error.keyValue || {})[0];
  if (key === 'email') {
    return new ApiError(409, 'An account with this email already exists', [
      { field: 'email', message: 'An account with this email already exists' },
    ]);
  }
  if (key === 'user') return new ApiError(409, 'A cart already exists for this user');
  return new ApiError(409, 'A record with this value already exists');
}

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let normalized = error;
  if (error instanceof multer.MulterError) {
    normalized = new ApiError(400, error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : error.message);
  }
  if (error.name === 'CastError') normalized = new ApiError(400, 'Invalid resource identifier');
  if (error.code === 11000) normalized = duplicateKeyError(error);
  if (error.name === 'ValidationError') {
    normalized = new ApiError(422, 'Validation failed', Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    })));
  }

  const statusCode = normalized.statusCode || 500;
  if (statusCode >= 500) logger.error({ err: error }, 'Request failed');
  const body = {
    success: false,
    message: statusCode === 500 ? 'Internal server error' : normalized.message,
  };
  if (normalized.errors) body.errors = normalized.errors;
  if (process.env.NODE_ENV === 'development' && statusCode === 500) body.stack = error.stack;
  res.status(statusCode).json(body);
}
