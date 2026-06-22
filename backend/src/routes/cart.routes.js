import { Router } from 'express';
import * as controller from '../controllers/cart.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addCartItemRules, cartProductIdRule, updateCartItemRules } from '../validators/cart.validators.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(controller.get));
router.post('/items', addCartItemRules, validate, asyncHandler(controller.add));
router.patch('/items/:productId', updateCartItemRules, validate, asyncHandler(controller.update));
router.delete('/items/:productId', cartProductIdRule, validate, asyncHandler(controller.remove));
router.delete('/', asyncHandler(controller.clear));
export default router;
