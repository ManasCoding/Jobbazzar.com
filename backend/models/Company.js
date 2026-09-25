import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String, required: true },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  address: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, default: 'Bhubaneswar', required: true },
  state: { type: String, default: 'Odisha', required: true },
  country: { type: String, default: 'India', required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  industry: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry' },
  companyType: { type: String, required: true },
  foundedYear: { type: Number },
  employeeCount: { type: String },
  isHiring: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  linkedin: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  careersUrl: { type: String },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
export default Company;
