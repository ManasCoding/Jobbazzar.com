import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = 'gumansingh.web@gmail.com';
  const adminPassword = '12345678';

  const userExists = await User.findOne({ email: adminEmail });

  if (!userExists) {
    await User.create({
      name: 'Guman Singh',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin user seeded successfully');
  } else {
    console.log('Admin user already exists');
  }

  process.exit();
};

seedAdmin();
