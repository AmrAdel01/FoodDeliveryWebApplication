import { logger } from '../config/logger.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { connectDatabase, disconnectDatabase } from './connect.js';

await connectDatabase();
try {
  const results = await Promise.all([
    User.syncIndexes(),
    Product.syncIndexes(),
    Cart.syncIndexes(),
    Order.syncIndexes(),
  ]);
  logger.info({ droppedIndexes: results.flat() }, 'MongoDB indexes synchronized');
} finally {
  await disconnectDatabase();
}
