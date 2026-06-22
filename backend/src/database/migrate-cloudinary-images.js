import { logger } from '../config/logger.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { imageService } from '../services/image.service.js';
import { connectDatabase, disconnectDatabase } from './connect.js';

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

async function downloadImage(source) {
  const url = new URL(source);
  if (url.protocol !== 'https:') throw new Error(`Refusing non-HTTPS image URL: ${url.hostname}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Image download failed with HTTP ${response.status}`);
  const declaredSize = Number(response.headers.get('content-length')) || 0;
  if (declaredSize > MAX_SOURCE_BYTES) throw new Error('Source image exceeds 10 MB');
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_SOURCE_BYTES) throw new Error('Source image exceeds 10 MB');
  return buffer;
}

async function uploadLegacyImage(source) {
  return imageService.upload(await downloadImage(source));
}

await connectDatabase();
let productsMigrated = 0;
let ordersMigrated = 0;

try {
  const productCursor = Product.collection.find({ image: { $type: 'string' } });
  for await (const product of productCursor) {
    try {
      logger.info(`Migrating product ${product._id}`);
  
      const image = await uploadLegacyImage(product.image);
  
      const result = await Product.collection.updateOne(
        { _id: product._id, image: product.image },
        { $set: { image } }
      );
  
      if (!result.modifiedCount) {
        await imageService.delete(image.public_id);
      } else {
        productsMigrated++;
      }
    } catch (error) {
      logger.error({
        productId: product._id,
        image: product.image,
        error: error.message
      }, 'Failed to migrate product image');
  
      continue;
    }
  }

  const productImages = new Map();
  const orderCursor = Order.collection.find({ 'items.image': { $type: 'string' } });
  for await (const order of orderCursor) {
    const uploaded = [];
    const items = [];
    for (const item of order.items) {
      if (typeof item.image !== 'string') {
        items.push(item);
        continue;
      }
      const key = String(item.product);
      let image = productImages.get(key);
      if (!image) {
        const product = await Product.collection.findOne(
          { _id: item.product },
          { projection: { image: 1 } },
        );
        image = product?.image?.public_id ? product.image : await uploadLegacyImage(item.image);
        productImages.set(key, image);
        if (!product?.image?.public_id) uploaded.push(image.public_id);
      }
      items.push({ ...item, image });
    }
    const result = await Order.collection.updateOne({ _id: order._id }, { $set: { items } });
    if (!result.modifiedCount) await Promise.all(uploaded.map((id) => imageService.delete(id)));
    else ordersMigrated += 1;
  }

  logger.info({ productsMigrated, ordersMigrated }, 'Legacy images migrated to Cloudinary');
} finally {
  await disconnectDatabase();
}
