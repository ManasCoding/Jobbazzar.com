import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Patia', 'Chandrasekharpur'
  slug: { type: String, required: true, unique: true },
  city: { type: String, default: 'Bhubaneswar', enum: ['Bhubaneswar'], required: true },
  description: { type: String },
  latitude: { type: Number },
  longitude: { type: Number }
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);
export default Location;
