import { orderRepository } from '../repositories/order.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { invalidateProductCache } from './cache.service.js';

export async function getStats() {
  const [totalUsers, totalOrders, totalProducts, revenue] = await Promise.all([
    userRepository.countCustomers(),
    orderRepository.countAll(),
    productRepository.countAll(),
    orderRepository.paidRevenue(),
  ]);
  return { totalUsers, totalOrders, totalProducts, totalRevenue: revenue[0]?.total || 0 };
}

export async function listAllOrders(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.status) filter.orderStatus = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  const { orders, total } = await orderRepository.listAdmin(filter, { skip, limit });
  return { orders, meta: paginationMeta(total, page, limit) };
}

export async function getAdminOrder(id) {
  const order = await orderRepository.findAdmin(id);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

const transitions = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

export const canTransition = (currentStatus, nextStatus) => transitions[currentStatus]?.includes(nextStatus) || false;

export async function updateOrderStatus(id, status) {
  const current = await orderRepository.findStatus(id);
  if (!current) throw new ApiError(404, 'Order not found');
  if (!canTransition(current.orderStatus, status)) {
    throw new ApiError(409, `Order cannot move from ${current.orderStatus} to ${status}`);
  }
  const changes = { orderStatus: status };
  if (status === 'Delivered' && current.paymentMethod === 'COD') changes.paymentStatus = 'Paid';
  const order = await orderRepository.transition(id, current.orderStatus, status, changes);
  if (!order) throw new ApiError(409, 'Order status changed concurrently; reload and try again');
  if (status === 'Cancelled') {
    await productRepository.restoreStock(order.items);
  }
  await invalidateProductCache();
  return order;
}
