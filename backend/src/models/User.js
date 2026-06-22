import mongoose from 'mongoose';
import { ROLES } from '../constants/index.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (_document, object) => {
    delete object.password;
    delete object.__v;
    return object;
  },
});

export const User = mongoose.model('User', userSchema);
