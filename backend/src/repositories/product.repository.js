import { Product } from '../models/Product.js';

const publicProjection = 'name description category image.secure_url price stock isAvailable createdAt';
const adminProjection = `${publicProjection} image.public_id updatedAt`;

export class ProductRepository {
  async list({ filter, sort, skip, limit, includePrivate = false }) {
    const projection = includePrivate ? adminProjection : publicProjection;
    const [products, total] = await Promise.all([
      Product.find(filter).select(projection).sort(sort).skip(skip).limit(limit).lean().exec(),
      Product.countDocuments(filter).exec(),
    ]);
    return { products, total };
  }

  findById(id, { includeUnavailable = false, includePrivate = false } = {}) {
    const filter = { _id: id };
    if (!includeUnavailable) filter.isAvailable = true;
    return Product.findOne(filter)
      .select(includePrivate ? adminProjection : publicProjection)
      .lean()
      .exec();
  }

  findByIdForWrite(id) {
    return Product.findById(id).select(adminProjection).lean().exec();
  }

  async create(input) {
    const product = await Product.create(input);
    return product.toObject();
  }

  update(id, input) {
    return Product.findByIdAndUpdate(id, input, { new: true, runValidators: true })
      .select(adminProjection)
      .lean()
      .exec();
  }

  delete(id) {
    return Product.findByIdAndDelete(id).lean().exec();
  }

  findAvailability(id) {
    return Product.findById(id).select('price stock isAvailable').lean().exec();
  }

  countAll() {
    return Product.countDocuments().exec();
  }

  reserveStock(item) {
    return Product.updateOne(
      { _id: item.product, isAvailable: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
    ).exec();
  }

  restoreStock(items) {
    if (!items.length) return Promise.resolve();
    return Product.bulkWrite(items.map((item) => ({
      updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } },
    })));
  }

  categories() {
    return Product.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]).exec();
  }

}

export const productRepository = new ProductRepository();
