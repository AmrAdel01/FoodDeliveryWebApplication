import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS = 12;

function authPayload(user) {
  return { user: user.toJSON(), token: signToken(user) };
}

export async function register(input) {
  const emailExists = await userRepository.existsByEmail(input.email);
  if (emailExists) throw new ApiError(409, 'An account with this email already exists');

  const password = await bcrypt.hash(input.password, SALT_ROUNDS);
  try {
    const user = await userRepository.create({ name: input.name, email: input.email, password });
    return authPayload(user);
  } catch (error) {
    if (error.code === 11000 && (error.keyPattern?.email || error.keyValue?.email)) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const user = await userRepository.findForLogin(email);
  if (!user) throw new ApiError(404, 'No account found with this email');
  if (!(await bcrypt.compare(password, user.password))) throw new ApiError(401, 'Incorrect password');
  return authPayload(user);
}
