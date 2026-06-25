import { body } from 'express-validator';

export const registerRules = [
  body('name').trim()
    .notEmpty().withMessage('Name is required').bail()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('email').trim()
    .notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Enter a valid email address').bail()
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required').bail()
    .isLength({ min: 8 }).withMessage('Password must contain at least 8 characters').bail()
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter').bail()
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter').bail()
    .matches(/\d/).withMessage('Password must contain a number'),
];

export const loginRules = [
  body('email').trim()
    .notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Enter a valid email address').bail()
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
