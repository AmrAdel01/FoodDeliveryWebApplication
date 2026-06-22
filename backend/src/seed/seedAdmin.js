import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { User } from '../models/User.js';
import { connectDatabase, disconnectDatabase } from '../database/connect.js';

config();

async function seedAdmin() {
  try {
    await connectDatabase();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'System Admin';

    if (!email || !password) {
      throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('👤 Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin created successfully');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await disconnectDatabase();
    process.exit();
  }
}

seedAdmin();