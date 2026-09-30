import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './models/Company.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Fix known wrong coordinates in the database
const fixes = [
  {
    name: /oditech/i,
    latitude: 20.2723,   // Acharya Vihar, Bhubaneswar (from Google Maps)
    longitude: 85.8455,
  }
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    for (const fix of fixes) {
      const result = await Company.updateMany(
        { name: fix.name },
        { $set: { latitude: fix.latitude, longitude: fix.longitude } }
      );
      console.log(`Fixed "${fix.name}" → ${result.modifiedCount} record(s) updated`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Done!');
  }
}

run();
