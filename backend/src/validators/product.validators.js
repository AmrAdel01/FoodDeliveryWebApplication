import { body, param } from 'express-validator';
import { CATEGORIES } from '../constants/index.js';

function productRules(partial = false) {
  const required = (chain) => (partial ? chain.optional() : chain);
  return [
    required(body('name')).trim()
      .notEmpty().withMessage('Product name is required').bail()
      .isLength({ min: 2, max: 120 }).withMessage('Product name must be between 2 and 120 characters'),
    required(body('description')).trim()
      .notEmpty().withMessage('Product description is required').bail()
      .isLength({ min: 5, max: 1000 }).withMessage('Product description must be between 5 and 1000 characters'),
    required(body('category'))
      .notEmpty().withMessage('Product category is required').bail()
      .isIn(CATEGORIES).withMessage(`Product category must be one of: ${CATEGORIES.join(', ')}`),
    required(body('price'))
      .notEmpty().withMessage('Product price is required').bail()
      .isFloat({ min: 0 }).withMessage('Product price must be a non-negative number')
      .toFloat(),
    required(body('stock'))
      .notEmpty().withMessage('Product stock is required').bail()
      .isInt({ min: 0 }).withMessage('Product stock must be a non-negative whole number')
      .toInt(),
    body('isAvailable').optional()
      .isBoolean().withMessage('Product availability must be true or false')
      .toBoolean(),
  ];
}

export const createProductRules = productRules();
export const updateProductRules = productRules(true);
export const productIdRule = [param('id').isMongoId().withMessage('Invalid product identifier')];
