import { Router } from 'express';
import * as controller from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { productIdRule } from '../validators/product.validators.js';

const router = Router();
router.get('/', asyncHandler(controller.list));
router.get('/categories', asyncHandler(controller.categories));
router.get('/trending', asyncHandler(controller.trending));
router.get('/:id', productIdRule, validate, asyncHandler(controller.getOne));
export default router;
