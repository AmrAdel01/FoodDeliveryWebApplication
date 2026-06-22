import * as adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export async function stats(_req, res) {
  return sendSuccess(res, { data: await adminService.getStats() });
}

export async function orders(req, res) {
  const { orders: data, meta } = await adminService.listAllOrders(req.query);
  return sendSuccess(res, { data, meta });
}

export async function order(req, res) {
  return sendSuccess(res, { data: await adminService.getAdminOrder(req.params.id) });
}

export async function updateStatus(req, res) {
  const data = await adminService.updateOrderStatus(req.params.id, req.body.status);
  return sendSuccess(res, { message: 'Order status updated', data });
}
