import bcrypt from 'bcrypt';
import { ROLES } from '../constants/index.js';
import { connectDatabase, disconnectDatabase } from '../database/connect.js';
import { User } from '../models/User.js';

async function seedAdmin() {
  try {
    await connectDatabase();

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME?.trim() || 'System Admin';

    if (!email || !password) {
      throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in backend/.env');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        role: ROLES.ADMIN,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).select('email role');

    console.log(`Admin ready: ${admin.email} (${admin.role})`);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

await seedAdmin();
