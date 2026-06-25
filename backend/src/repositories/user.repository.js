import { User } from '../models/User.js';

export class UserRepository {
  findPublicById(id) {
    return User.findById(id).select('name email role').lean().exec();
  }

  findForLogin(email) {
    return User.findOne({ email }).select('+password').exec();
  }

  existsByEmail(email) {
    return User.exists({ email }).exec();
  }

  create(input) {
    return User.create(input);
  }

  countCustomers() {
    return User.countDocuments({ role: 'user' }).exec();
  }
}

export const userRepository = new UserRepository();
