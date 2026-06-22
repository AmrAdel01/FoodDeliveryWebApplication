import { Router } from 'express';
import * as controller from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrderRules, orderIdRule } from '../validators/order.validators.js';

const router = Router();
router.use(authenticate);
router.post('/', createOrderRules, validate, asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/:id', orderIdRule, validate, asyncHandler(controller.getOne));
router.patch('/:id/cancel', orderIdRule, validate, asyncHandler(controller.cancel));
router.post('/:id/pay', orderIdRule, validate, asyncHandler(controller.pay));
export default router;
