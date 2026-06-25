import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcrypt';
import { userRepository } from '../src/repositories/user.repository.js';
import * as authService from '../src/services/auth.service.js';

test('login reports when no account exists for an email', async (t) => {
  t.mock.method(userRepository, 'findForLogin', async () => null);

  await assert.rejects(
    () => authService.login({ email: 'missing@example.com', password: 'Password123' }),
    {
      statusCode: 404,
      message: 'No account found with this email',
    },
  );
});

test('login reports an incorrect password for an existing account', async (t) => {
  const hashedPassword = await bcrypt.hash('Correct123', 4);
  t.mock.method(userRepository, 'findForLogin', async () => ({
    password: hashedPassword,
    toJSON: () => ({
      id: '64f2a0c23fd7b4ed1f4d8a11',
      name: 'Customer',
      email: 'customer@example.com',
      role: 'user',
    }),
  }));

  await assert.rejects(
    () => authService.login({ email: 'customer@example.com', password: 'Wrong123' }),
    {
      statusCode: 401,
      message: 'Incorrect password',
    },
  );
});

test('register reports when the email already exists', async (t) => {
  t.mock.method(userRepository, 'existsByEmail', async () => true);

  await assert.rejects(
    () => authService.register({
      name: 'Customer',
      email: 'customer@example.com',
      password: 'Password123',
    }),
    {
      statusCode: 409,
      message: 'An account with this email already exists',
    },
  );
});
