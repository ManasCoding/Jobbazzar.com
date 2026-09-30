import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './models/Company.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const c = await Company.findOne({ name: /tech\s*mahindra/i });
    if (c) {
      console.log('Found:', JSON.stringify({
        id: c._id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        isActive: c.isActive
      }, null, 2));
    } else {
      console.log('Not found in DB');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
