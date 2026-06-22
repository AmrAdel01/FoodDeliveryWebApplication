import mongoose from 'mongoose';
import { CATEGORIES } from '../constants/index.js';

const imageSchema = new mongoose.Schema({
  public_id: { type: String, required: true, trim: true },
  secure_url: { type: String, required: true, trim: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, required: true, enum: CATEGORIES },
  image: { type: imageSchema, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

productSchema.index({ name: 'text', description: 'text' }, { weights: { name: 10, description: 2 } });
productSchema.index({ isAvailable: 1, category: 1, createdAt: -1 });
productSchema.index({ isAvailable: 1, price: 1, _id: 1 });

export const Product = mongoose.model('Product', productSchema);
