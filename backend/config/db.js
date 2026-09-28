import dns from 'dns';
import mongoose from 'mongoose';

// Fix Node.js Windows SRV lookup issue for MongoDB Atlas clusters
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[DB] Could not set custom DNS servers:', e.message);
}

/**
 * Establishes a connection to MongoDB.
 * On failure: logs a warning and continues (server keeps running).
 * Fix: go to MongoDB Atlas → Network Access → Add IP Address → Allow Access From Anywhere (0.0.0.0/0)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection Error: ${error.message}`);
    console.warn('[DB] ⚠️  Server will continue running WITHOUT database.');
    console.warn('[DB] ➜  Fix: Go to MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0');
    console.warn('[DB] ➜  Company Fetch (AI) still works. Save/Login will fail until DB is fixed.');
    // DO NOT exit — keep server running so fetch API works
  }
};

export default connectDB;

