import { body, param } from 'express-validator';

export const addCartItemRules = [
  body('productId')
    .notEmpty().withMessage('Product is required').bail()
    .isMongoId().withMessage('Invalid product identifier'),
  body('quantity').optional()
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
    .toInt(),
];

export const updateCartItemRules = [
  param('productId').isMongoId().withMessage('Invalid product identifier'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required').bail()
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
    .toInt(),
];

export const cartProductIdRule = [param('productId').isMongoId().withMessage('Invalid product identifier')];
