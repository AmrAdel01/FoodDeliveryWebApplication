import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTotal } from '../src/services/cart.service.js';

test('calculateTotal sums quantities and rounds currency', () => {
  const total = calculateTotal([
    { unitPrice: 10.1, quantity: 2 },
    { unitPrice: 5.55, quantity: 3 },
  ]);
  assert.equal(total, 36.85);
});

test('calculateTotal returns zero for an empty cart', () => {
  assert.equal(calculateTotal([]), 0);
});
