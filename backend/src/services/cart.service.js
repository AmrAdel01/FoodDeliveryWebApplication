import { cartRepository } from '../repositories/cart.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { ApiError } from '../utils/ApiError.js';

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

function calculateTotal(items) {
  return roundMoney(items.reduce((total, item) => total + item.unitPrice * item.quantity, 0));
}

export async function getCart(userId) {
  let cart = await cartRepository.findPopulated(userId, { lean: false });
  if (!cart) {
    await cartRepository.ensureExists(userId);
    cart = await cartRepository.findPopulated(userId, { lean: false });
  }

  const previousLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.product?.isAvailable && item.product.stock > 0);
  let changed = previousLength !== cart.items.length;
  for (const item of cart.items) {
    const quantity = Math.min(item.quantity, item.product.stock);
    if (item.quantity !== quantity || item.unitPrice !== item.product.price) changed = true;
    item.quantity = quantity;
    item.unitPrice = item.product.price;
  }
  const totalPrice = calculateTotal(cart.items);
  if (cart.totalPrice !== totalPrice) changed = true;
  cart.totalPrice = totalPrice;
  if (changed) await cart.save();
  return cart.toObject();
}

export async function addItem(userId, productId, quantity = 1) {
  const product = await productRepository.findAvailability(productId);
  if (!product || !product.isAvailable) throw new ApiError(404, 'Product is not available');

  const cart = await cartRepository.findOrCreate(userId);
  const item = cart.items.find((entry) => entry.product.equals(product._id));
  const requestedQuantity = (item?.quantity || 0) + quantity;
  if (requestedQuantity > product.stock) throw new ApiError(409, 'Requested quantity exceeds current stock');

  if (item) {
    item.quantity = requestedQuantity;
    item.unitPrice = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, unitPrice: product.price });
  }
  cart.totalPrice = calculateTotal(cart.items);
  await cart.save();
  return cartRepository.findPopulated(userId);
}

export async function updateItem(userId, productId, quantity) {
  const [cart, product] = await Promise.all([
    cartRepository.findByUser(userId),
    productRepository.findAvailability(productId),
  ]);
  if (!cart) throw new ApiError(404, 'Cart not found');
  const item = cart.items.find((entry) => entry.product.equals(productId));
  if (!item) throw new ApiError(404, 'Cart item not found');
  if (!product?.isAvailable || quantity > product.stock) throw new ApiError(409, 'Requested quantity is not available');
  item.quantity = quantity;
  item.unitPrice = product.price;
  cart.totalPrice = calculateTotal(cart.items);
  await cart.save();
  return cartRepository.findPopulated(userId);
}

export async function removeItem(userId, productId) {
  const cart = await cartRepository.findByUser(userId);
  if (!cart) throw new ApiError(404, 'Cart not found');
  cart.items = cart.items.filter((entry) => !entry.product.equals(productId));
  cart.totalPrice = calculateTotal(cart.items);
  await cart.save();
  return cartRepository.findPopulated(userId);
}

export async function clearCart(userId) {
  await cartRepository.clear(userId);
  return cartRepository.findPopulated(userId);
}

export { calculateTotal };
