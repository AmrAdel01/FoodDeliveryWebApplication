import { Cart } from '../models/Cart.js';

const cartProjection = 'user items totalPrice updatedAt';
const productProjection = 'name image category price stock isAvailable';

export class CartRepository {
  findPopulated(userId, { lean = true, orderFields = false } = {}) {
    const fields = orderFields ? 'name image price stock isAvailable' : productProjection;
    const query = Cart.findOne({ user: userId })
      .select(cartProjection)
      .populate('items.product', fields);
    return lean ? query.lean().exec() : query.exec();
  }

  findByUser(userId) {
    return Cart.findOne({ user: userId }).exec();
  }

  findOrCreate(userId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { items: [], totalPrice: 0 } },
      { new: true, upsert: true },
    ).exec();
  }

  ensureExists(userId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { items: [], totalPrice: 0 } },
      { upsert: true },
    ).exec();
  }

  clear(userId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalPrice: 0 },
      { upsert: true },
    ).exec();
  }
}

export const cartRepository = new CartRepository();
