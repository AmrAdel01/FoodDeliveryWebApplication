import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const userOrderProjection = 'items shippingAddress paymentMethod paymentStatus orderStatus statusHistory totalPrice createdAt';

export class OrderRepository {
  create(input) {
    return Order.create(input);
  }

  delete(id) {
    return Order.deleteOne({ _id: id }).exec();
  }

  async listByUser(userId, { skip, limit }) {
    const filter = { user: userId };
    const [orders, total] = await Promise.all([
      Order.find(filter).select(userOrderProjection)
        .sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Order.countDocuments(filter).exec(),
    ]);
    return { orders, total };
  }

  findByUser(userId, id, { lean = true } = {}) {
    const query = Order.findOne({ _id: id, user: userId }).select(userOrderProjection);
    return lean ? query.lean().exec() : query.exec();
  }

  cancel(userId, id) {
    return Order.findOneAndUpdate(
      { _id: id, user: userId, orderStatus: { $in: ['Pending', 'Confirmed'] } },
      { $set: { orderStatus: 'Cancelled' }, $push: { statusHistory: { status: 'Cancelled' } } },
      { new: true },
    ).exec();
  }

  existsForUser(userId, id) {
    return Order.exists({ _id: id, user: userId });
  }

  countAll() {
    return Order.countDocuments().exec();
  }

  paidRevenue() {
    return Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]).exec();
  }

  async listAdmin(filter, { skip, limit }) {
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select('user paymentMethod paymentStatus orderStatus totalPrice createdAt')
        .populate('user', 'name email')
        .sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Order.countDocuments(filter).exec(),
    ]);
    return { orders, total };
  }

  findAdmin(id) {
    return Order.findById(id)
      .select('user items shippingAddress paymentMethod paymentStatus orderStatus statusHistory totalPrice createdAt')
      .populate('user', 'name email').lean().exec();
  }

  findStatus(id) {
    return Order.findById(id).select('orderStatus paymentMethod').lean().exec();
  }

  transition(id, currentStatus, status, changes) {
    return Order.findOneAndUpdate(
      { _id: id, orderStatus: currentStatus },
      { $set: changes, $push: { statusHistory: { status } } },
      { new: true, runValidators: true },
    ).exec();
  }

  trendingProducts(limit) {
    return Order.aggregate([
      { $match: { orderStatus: { $in: ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', salesCount: { $sum: '$items.quantity' } } },
      { $lookup: { from: Product.collection.name, localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.isAvailable': true } },
      { $sort: { salesCount: -1, _id: 1 } },
      { $limit: limit },
      { $project: {
        _id: '$product._id', name: '$product.name', description: '$product.description',
        category: '$product.category', image: { secure_url: '$product.image.secure_url' },
        price: '$product.price', stock: '$product.stock', isAvailable: '$product.isAvailable',
        salesCount: 1,
      } },
    ]).exec();
  }
}

export const orderRepository = new OrderRepository();
