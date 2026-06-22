import { body, param } from 'express-validator';
import { CATEGORIES } from '../constants/index.js';

function productRules(partial = false) {
  const required = (chain) => (partial ? chain.optional() : chain);
  return [
    required(body('name')).trim().isLength({ min: 2, max: 120 }),
    required(body('description')).trim().isLength({ min: 5, max: 1000 }),
    required(body('category')).isIn(CATEGORIES),
    required(body('price')).isFloat({ min: 0 }).toFloat(),
    required(body('stock')).isInt({ min: 0 }).toInt(),
    body('isAvailable').optional().isBoolean().toBoolean(),
  ];
}

export const createProductRules = productRules();
export const updateProductRules = productRules(true);
export const productIdRule = [param('id').isMongoId().withMessage('Invalid product identifier')];
