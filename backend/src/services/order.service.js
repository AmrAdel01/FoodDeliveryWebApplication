import { cartRepository } from '../repositories/cart.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { invalidateProductCache } from './cache.service.js';

export async function placeOrder(userId, input) {
  const cart = await cartRepository.findPopulated(userId, { lean: false, orderFields: true });
  if (!cart?.items.length) throw new ApiError(400, 'Your cart is empty');

  for (const item of cart.items) {
    if (!item.product?.isAvailable || item.product.stock < item.quantity) {
      throw new ApiError(409, `${item.product?.name || 'An item'} is no longer available in the requested quantity`);
    }
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    quantity: item.quantity,
    unitPrice: item.product.price,
  }));
  const totalPrice = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  let reserved = [];
  let order;
  try {
    const reservationResults = await Promise.all(
      items.map((item) => productRepository.reserveStock(item)),
    );
    reserved = items.filter((_item, index) => reservationResults[index].modifiedCount === 1);
    const failedIndex = reservationResults.findIndex((result) => result.modifiedCount !== 1);
    if (failedIndex !== -1) {
      throw new ApiError(409, `${items[failedIndex].name} is no longer available in the requested quantity`);
    }

    order = await orderRepository.create({
      user: userId,
      items,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      totalPrice: Math.round((totalPrice + Number.EPSILON) * 100) / 100,
    });
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    await invalidateProductCache();
    return order;
  } catch (error) {
    if (order) await orderRepository.delete(order._id);
    await productRepository.restoreStock(reserved);
    throw error;
  }
}

export async function listUserOrders(userId, query) {
  const { page, limit, skip } = getPagination(query);
  const { orders, total } = await orderRepository.listByUser(userId, { skip, limit });
  return { orders, meta: paginationMeta(total, page, limit) };
}

export async function getUserOrder(userId, id) {
  const order = await orderRepository.findByUser(userId, id);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

async function getMutableUserOrder(userId, id) {
  const order = await orderRepository.findByUser(userId, id, { lean: false });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

export async function cancelOrder(userId, id) {
  const order = await orderRepository.cancel(userId, id);
  if (!order) {
    const exists = await orderRepository.existsForUser(userId, id);
    if (!exists) throw new ApiError(404, 'Order not found');
    throw new ApiError(409, 'This order can no longer be cancelled');
  }
  await productRepository.restoreStock(order.items);
  await invalidateProductCache();
  return order;
}

export async function payForOrder(userId, id, shouldFail = false) {
  const order = await getMutableUserOrder(userId, id);
  if (order.paymentMethod !== 'ONLINE') throw new ApiError(400, 'This order does not use online payment');
  if (order.paymentStatus === 'Paid') throw new ApiError(409, 'Order is already paid');
  if (order.orderStatus === 'Cancelled') throw new ApiError(409, 'Cancelled orders cannot be paid');
  order.paymentStatus = shouldFail ? 'Failed' : 'Paid';
  if (!shouldFail && order.orderStatus === 'Pending') {
    order.orderStatus = 'Confirmed';
    order.statusHistory.push({ status: 'Confirmed' });
  }
  await order.save();
  if (!shouldFail) await invalidateProductCache();
  return order;
}
