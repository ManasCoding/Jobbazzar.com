import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry',
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'],
      required: true,
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site',
    },
    experience: {
      type: String,
      enum: ['Fresher', '0-1 yr', '1-3 yrs', '3-5 yrs', '5+ yrs'],
      required: true,
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryNegotiable: { type: Boolean, default: false },
    skills: [{ type: String }],
    openings: { type: Number, default: 1 },
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: 'text', description: 'text' });

const Job = mongoose.model('Job', jobSchema);
export default Job;
