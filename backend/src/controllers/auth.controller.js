import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export async function register(req, res) {
  const data = await authService.register(req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Account created', data });
}

export async function login(req, res) {
  const data = await authService.login(req.body);
  return sendSuccess(res, { message: 'Signed in', data });
}

export async function me(req, res) {
  return sendSuccess(res, { data: req.user });
}
