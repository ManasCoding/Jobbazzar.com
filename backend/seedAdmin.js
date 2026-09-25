import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const admins = [
  {
    name: 'Guman Singh',
    email: 'gumansingh.oditechglobal@gmail.com',
    password: '123456',
    role: 'admin'
  },
  {
    name: 'Guman Singh',
    email: 'gumansingh.web@gmail.com',
    password: '12345678',
    role: 'admin'
  }
];

const seedAdmin = async () => {
  try {
    await connectDB();

    for (const adminData of admins) {
      const userExists = await User.findOne({ email: adminData.email });

      if (!userExists) {
        await User.create(adminData);
        console.log(`Admin user ${adminData.email} seeded successfully`);
      } else {
        if (userExists.role !== 'admin') {
          userExists.role = 'admin';
          await userExists.save();
          console.log(`Updated user ${adminData.email} role to admin`);
        } else {
          console.log(`Admin user ${adminData.email} already exists`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding admin users:', error.message);
  } finally {
    process.exit();
  }
};

seedAdmin();
