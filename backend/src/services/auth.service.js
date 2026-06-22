import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS = 12;

function authPayload(user) {
  return { user: user.toJSON(), token: signToken(user) };
}

export async function register(input) {
  const password = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await userRepository.create({ name: input.name, email: input.email, password });
  return authPayload(user);
}

export async function login({ email, password }) {
  const user = await userRepository.findForLogin(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  return authPayload(user);
}
