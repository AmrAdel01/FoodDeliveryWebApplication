import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAuthenticatedUser } from '../src/middlewares/auth.js';
import { cacheKeys } from '../src/services/cache.service.js';
import { CloudinaryImageService } from '../src/services/image.service.js';
import { buildListOptions } from '../src/services/product.service.js';

test('product cache keys are deterministic across query parameter order', () => {
  assert.equal(
    cacheKeys.productList({ category: 'Pizza', page: '2' }),
    cacheKeys.productList({ page: '2', category: 'Pizza' }),
  );
});

test('product query builder applies filters, paging, and stable sorting', () => {
  const result = buildListOptions({
    page: '2',
    limit: '12',
    category: 'Pizza',
    keyword: 'cheese',
    minPrice: '50',
    maxPrice: '250',
    sort: '-price',
  });
  assert.equal(result.skip, 12);
  assert.deepEqual(result.filter, {
    isAvailable: true,
    category: 'Pizza',
    price: { $gte: 50, $lte: 250 },
    $text: { $search: 'cheese' },
  });
  assert.deepEqual(result.sort, { price: -1, _id: 1 });
});

test('Cloudinary adapter exposes only required image metadata', async () => {
  const client = {
    uploader: {
      upload_stream: (options, callback) => ({
        end: () => callback(null, {
          public_id: `${options.folder}/pizza`,
          secure_url: 'https://res.cloudinary.com/demo/pizza.webp',
          width: 1200,
          bytes: 5000,
        }),
      }),
      destroy: async () => ({ result: 'ok' }),
    },
  };
  const service = new CloudinaryImageService(client, 'products', true, 'test-cloud');
  assert.deepEqual(await service.upload(Buffer.from('image')), {
    public_id: 'products/pizza',
    secure_url: 'https://res.cloudinary.com/demo/pizza.webp',
  });
  await service.delete('products/pizza');
});

test('authenticated lean users expose a stable id field', () => {
  const user = normalizeAuthenticatedUser({
    _id: { toString: () => '64f2a0c23fd7b4ed1f4d8a11' },
    name: 'Customer',
    email: 'customer@example.com',
    role: 'user',
  });

  assert.deepEqual(user, {
    id: '64f2a0c23fd7b4ed1f4d8a11',
    name: 'Customer',
    email: 'customer@example.com',
    role: 'user',
  });
});
