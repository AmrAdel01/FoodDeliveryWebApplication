import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new ApiError(422, 'Validation failed', result.array().map(({ path, msg }) => ({ field: path, message: msg }))));
  }
  return next();
}
