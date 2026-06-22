import { body, param } from 'express-validator';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../constants/index.js';

export const createOrderRules = [
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.phone').trim().matches(/^\+?[0-9 ()-]{7,20}$/).withMessage('A valid phone is required'),
  body('shippingAddress.label').optional().trim().isLength({ max: 40 }),
  body('shippingAddress.notes').optional().trim().isLength({ max: 300 }),
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage('Payment method must be COD or ONLINE'),
];

export const orderIdRule = [param('id').isMongoId().withMessage('Invalid order identifier')];
export const updateOrderStatusRules = [
  ...orderIdRule,
  body('status').isIn(ORDER_STATUSES).withMessage('Invalid order status'),
];
