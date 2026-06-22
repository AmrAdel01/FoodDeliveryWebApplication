import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from './connect.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { imageService } from '../services/image.service.js';
import { logger } from '../config/logger.js';

await connectDatabase();

const products = [
  ['Margherita Pizza', 'Tomato sauce, fresh mozzarella, basil, and olive oil.', 'Pizza', 180, 25],
  ['Pepperoni Pizza', 'Mozzarella, tomato sauce, and crisp beef pepperoni.', 'Pizza', 235, 20],
  ['Classic Burger', 'Grilled beef patty, cheddar, lettuce, tomato, and house sauce.', 'Burgers', 155, 30],
  ['Crispy Chicken Burger', 'Crispy chicken, slaw, pickles, and spicy mayo.', 'Burgers', 165, 18],
  ['Penne Arrabbiata', 'Penne tossed in a bold tomato, garlic, and chili sauce.', 'Pasta', 145, 22],
  ['Chicken Alfredo', 'Fettuccine, grilled chicken, parmesan, and creamy sauce.', 'Pasta', 195, 16],
  ['Fresh Lemonade', 'Freshly squeezed lemon, mint, and a touch of sweetness.', 'Drinks', 55, 50],
  ['Iced Coffee', 'Cold espresso, milk, and ice.', 'Drinks', 75, 40],
  ['Chocolate Lava Cake', 'Warm chocolate cake with a molten center.', 'Desserts', 95, 15],
  ['Lotus Cheesecake', 'Creamy cheesecake with a spiced biscuit crust.', 'Desserts', 110, 14],
];

function placeholderImage(name, category) {
  const label = `${name} - ${category}`.replace(/[<>&'\"]/g, '');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="#173c34"/>
    <circle cx="600" cy="330" r="210" fill="#d99b5d" opacity=".9"/>
    <text x="600" y="660" text-anchor="middle" fill="#fffaf1" font-family="Arial" font-size="48">${label}</text>
  </svg>`);
}

try {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error('ADMIN_PASSWORD is required for seeding');

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: process.env.ADMIN_NAME || 'Platform Admin',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
    },
    { upsert: true, runValidators: true },
  );

  for (const [name, description, category, price, stock] of products) {
    const current = await Product.collection.findOne({ name }, { projection: { image: 1 } });
    const image = current?.image?.public_id && current?.image?.secure_url
      ? current.image
      : await imageService.upload(placeholderImage(name, category));
    await Product.findOneAndUpdate(
      { name },
      { name, description, category, price, stock, image, isAvailable: true },
      { upsert: true, runValidators: true },
    );
  }

  logger.info({ adminEmail, products: products.length }, 'Database seeded');
} finally {
  await disconnectDatabase();
}
