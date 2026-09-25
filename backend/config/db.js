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
 * Exits the process on failure so the server never starts in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
