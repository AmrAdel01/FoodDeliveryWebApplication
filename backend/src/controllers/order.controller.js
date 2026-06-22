import * as orderService from '../services/order.service.js';
import { sendSuccess } from '../utils/response.js';

export async function create(req, res) {
  const order = await orderService.placeOrder(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Order placed', data: order });
}

export async function list(req, res) {
  const { orders, meta } = await orderService.listUserOrders(req.user.id, req.query);
  return sendSuccess(res, { data: orders, meta });
}

export async function getOne(req, res) {
  return sendSuccess(res, { data: await orderService.getUserOrder(req.user.id, req.params.id) });
}

export async function cancel(req, res) {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  return sendSuccess(res, { message: 'Order cancelled', data: order });
}

export async function pay(req, res) {
  const order = await orderService.payForOrder(req.user.id, req.params.id, req.body.simulate === 'failure');
  return sendSuccess(res, {
    statusCode: order.paymentStatus === 'Failed' ? 402 : 200,
    message: order.paymentStatus === 'Failed' ? 'Mock payment failed' : 'Payment completed',
    data: order,
  });
}
