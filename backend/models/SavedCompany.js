import mongoose from 'mongoose';

const savedCompanySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

savedCompanySchema.index({ user: 1, company: 1 }, { unique: true });

const SavedCompany = mongoose.model('SavedCompany', savedCompanySchema);
export default SavedCompany;
