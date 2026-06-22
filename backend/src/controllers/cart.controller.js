import * as cartService from '../services/cart.service.js';
import { sendSuccess } from '../utils/response.js';

export async function get(req, res) {
  return sendSuccess(res, { data: await cartService.getCart(req.user.id) });
}

export async function add(req, res) {
  const cart = await cartService.addItem(req.user.id, req.body.productId, req.body.quantity);
  return sendSuccess(res, { message: 'Item added to cart', data: cart });
}

export async function update(req, res) {
  const cart = await cartService.updateItem(req.user.id, req.params.productId, req.body.quantity);
  return sendSuccess(res, { message: 'Cart updated', data: cart });
}

export async function remove(req, res) {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  return sendSuccess(res, { message: 'Item removed', data: cart });
}

export async function clear(req, res) {
  return sendSuccess(res, { message: 'Cart cleared', data: await cartService.clearCart(req.user.id) });
}
