import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginRules, registerRules } from '../validators/auth.validators.js';

const router = Router();
router.post('/register', registerRules, validate, asyncHandler(controller.register));
router.post('/login', loginRules, validate, asyncHandler(controller.login));
router.get('/me', authenticate, asyncHandler(controller.me));
export default router;
