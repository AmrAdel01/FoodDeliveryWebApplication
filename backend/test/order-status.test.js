import assert from 'node:assert/strict';
import test from 'node:test';
import { canTransition } from '../src/services/admin.service.js';

test('order status permits only forward operational transitions', () => {
  assert.equal(canTransition('Pending', 'Confirmed'), true);
  assert.equal(canTransition('Confirmed', 'Preparing'), true);
  assert.equal(canTransition('Preparing', 'Out for Delivery'), true);
  assert.equal(canTransition('Out for Delivery', 'Delivered'), true);
});

test('terminal and backward order status transitions are rejected', () => {
  assert.equal(canTransition('Delivered', 'Preparing'), false);
  assert.equal(canTransition('Cancelled', 'Pending'), false);
  assert.equal(canTransition('Preparing', 'Confirmed'), false);
});
