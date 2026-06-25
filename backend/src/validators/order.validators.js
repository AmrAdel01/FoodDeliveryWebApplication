import { body, param } from 'express-validator';
import { ORDER_STATUSES, PAYMENT_METHODS } from '../constants/index.js';

export const createOrderRules = [
  body('shippingAddress.street').trim()
    .notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim()
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.phone').trim()
    .notEmpty().withMessage('Phone number is required').bail()
    .matches(/^\+?[0-9 ()-]{7,20}$/).withMessage('Enter a valid phone number'),
  body('shippingAddress.label').optional().trim()
    .isLength({ max: 40 }).withMessage('Address label must be 40 characters or fewer'),
  body('shippingAddress.notes').optional().trim()
    .isLength({ max: 300 }).withMessage('Delivery notes must be 300 characters or fewer'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required').bail()
    .isIn(PAYMENT_METHODS).withMessage('Payment method must be COD or ONLINE'),
];

export const orderIdRule = [param('id').isMongoId().withMessage('Invalid order identifier')];
export const updateOrderStatusRules = [
  ...orderIdRule,
  body('status')
    .notEmpty().withMessage('Order status is required').bail()
    .isIn(ORDER_STATUSES).withMessage('Invalid order status'),
];
