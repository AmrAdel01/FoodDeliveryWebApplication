import { body, param } from 'express-validator';

export const addCartItemRules = [
  body('productId').isMongoId().withMessage('Invalid product identifier'),
  body('quantity').optional().isInt({ min: 1, max: 99 }).toInt(),
];

export const updateCartItemRules = [
  param('productId').isMongoId().withMessage('Invalid product identifier'),
  body('quantity').isInt({ min: 1, max: 99 }).toInt(),
];

export const cartProductIdRule = [param('productId').isMongoId().withMessage('Invalid product identifier')];
