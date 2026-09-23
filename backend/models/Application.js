import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resume: { type: String, required: true }, // URL or path
  coverLetter: { type: String },
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String },
  status: { 
    type: String, 
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Selected'],
    default: 'Applied'
  }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
