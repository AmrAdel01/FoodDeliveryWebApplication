import { CATEGORIES } from '../constants/index.js';
import { productRepository } from '../repositories/product.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { cacheKeys, cacheService, invalidateProductCache } from './cache.service.js';
import { imageService } from './image.service.js';

const sorts = Object.freeze({
  '-createdAt': { createdAt: -1, _id: -1 },
  createdAt: { createdAt: 1, _id: 1 },
  '-price': { price: -1, _id: 1 },
  price: { price: 1, _id: 1 },
  '-name': { name: -1, _id: 1 },
  name: { name: 1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
});

export function buildListOptions(query, includeUnavailable = false) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (!includeUnavailable) filter.isAvailable = true;
  if (query.category) {
    if (!CATEGORIES.includes(query.category)) throw new ApiError(400, 'Invalid product category');
    filter.category = query.category;
  }
  if (includeUnavailable && ['true', 'false'].includes(query.available)) {
    filter.isAvailable = query.available === 'true';
  }

  const minPrice = query.minPrice === undefined ? undefined : Number(query.minPrice);
  const maxPrice = query.maxPrice === undefined ? undefined : Number(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0))
      || (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))) {
      throw new ApiError(400, 'Price filters must be positive numbers');
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new ApiError(400, 'minPrice cannot exceed maxPrice');
    }
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const keyword = String(query.keyword || query.search || '').trim().slice(0, 100);
  if (keyword) filter.$text = { $search: keyword };
  const sortKey = query.sort || '-createdAt';
  if (!sorts[sortKey]) throw new ApiError(400, 'Unsupported product sort');
  const cacheQuery = {
    page,
    limit,
    category: query.category || '',
    keyword,
    minPrice: minPrice ?? '',
    maxPrice: maxPrice ?? '',
    sort: sortKey,
  };
  return { page, limit, skip, filter, sort: sorts[sortKey], cacheQuery };
}

export async function listProducts(query, { includeUnavailable = false } = {}) {
  const options = buildListOptions(query, includeUnavailable);
  const load = async () => {
    const { products, total } = await productRepository.list({
      ...options,
      includePrivate: includeUnavailable,
    });
    return { products, meta: paginationMeta(total, options.page, options.limit) };
  };
  if (includeUnavailable) return load();
  return cacheService.remember(cacheKeys.productList(options.cacheQuery), load);
}

export async function getProduct(id, options = {}) {
  const load = async () => {
    const product = await productRepository.findById(id, options);
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  };
  if (options.includeUnavailable) return load();
  return cacheService.remember(cacheKeys.product(id), load);
}

export const listCategories = () => cacheService.remember(
  cacheKeys.categories(),
  () => productRepository.categories(),
  900,
);

export function listTrendingProducts(query) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 8, 1), 20);
  return cacheService.remember(cacheKeys.trending(limit), () => orderRepository.trendingProducts(limit), 600);
}

export async function createProduct(input, file) {
  if (!file) throw new ApiError(400, 'Product image is required');
  const image = await imageService.upload(file.buffer);
  try {
    const product = await productRepository.create({ ...input, image });
    await invalidateProductCache();
    return product;
  } catch (error) {
    await imageService.delete(image.public_id).catch(() => {});
    throw error;
  }
}

export async function updateProduct(id, input, file) {
  const existing = await productRepository.findByIdForWrite(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  let image;
  if (file) {
    await imageService.delete(existing.image.public_id);
    image = await imageService.upload(file.buffer);
  }
  try {
    const product = await productRepository.update(id, image ? { ...input, image } : input);
    if (!product) throw new ApiError(404, 'Product not found');
    await invalidateProductCache();
    return product;
  } catch (error) {
    if (image) await imageService.delete(image.public_id).catch(() => {});
    throw error;
  }
}

export async function deleteProduct(id) {
  const existing = await productRepository.findByIdForWrite(id);
  if (!existing) throw new ApiError(404, 'Product not found');
  await imageService.delete(existing.image.public_id);
  await productRepository.delete(id);
  await invalidateProductCache();
}
