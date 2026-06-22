import * as productService from '../services/product.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const { products, meta } = await productService.listProducts(req.query);
  return sendSuccess(res, { data: products, meta });
}

export async function adminList(req, res) {
  const { products, meta } = await productService.listProducts(req.query, { includeUnavailable: true });
  return sendSuccess(res, { data: products, meta });
}

export async function getOne(req, res) {
  return sendSuccess(res, { data: await productService.getProduct(req.params.id) });
}

export async function categories(_req, res) {
  return sendSuccess(res, { data: await productService.listCategories() });
}

export async function trending(req, res) {
  return sendSuccess(res, { data: await productService.listTrendingProducts(req.query) });
}

export async function create(req, res) {
  const product = await productService.createProduct(req.body, req.file);
  return sendSuccess(res, { statusCode: 201, message: 'Product created', data: product });
}

export async function update(req, res) {
  const product = await productService.updateProduct(req.params.id, req.body, req.file);
  return sendSuccess(res, { message: 'Product updated', data: product });
}

export async function remove(req, res) {
  await productService.deleteProduct(req.params.id);
  return sendSuccess(res, { message: 'Product deleted' });
}
