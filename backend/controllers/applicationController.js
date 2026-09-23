import Application from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Apply for a Job ──────────────────────────────────────────────────────────

/**
 * @desc   Apply for a job
 * @route  POST /api/v1/applications
 * @access Private
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const { job, fullName, email, phone, resume, coverLetter, linkedin, github, portfolio } =
    req.body;

  if (!job || !fullName || !email || !phone || !resume) {
    throw new ApiError(400, 'Job, full name, email, phone, and resume are required');
  }

  // Verify job exists
  const jobDoc = await Job.findById(job);
  if (!jobDoc || !jobDoc.isActive) throw new ApiError(404, 'Job not found or no longer active');

  // Prevent duplicate applications
  const alreadyApplied = await Application.findOne({ job, user: req.user._id });
  if (alreadyApplied) throw new ApiError(409, 'You have already applied for this job');

  const application = await Application.create({
    job,
    user: req.user._id,
    company: jobDoc.company,
    fullName,
    email,
    phone,
    resume,
    coverLetter,
    linkedin,
    github,
    portfolio,
  });

  res.status(201).json(new ApiResponse(201, application, 'Application submitted successfully'));
});

// ─── Get My Applications ──────────────────────────────────────────────────────

/**
 * @desc   Get all applications submitted by the logged-in user
 * @route  GET /api/v1/applications/me
 * @access Private
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user._id })
    .populate({ path: 'job', select: 'title jobType workMode' })
    .populate({ path: 'company', select: 'name logo city' })
    .sort('-createdAt');

  res.json(new ApiResponse(200, applications, 'Your applications fetched successfully'));
});

// ─── Get Applications for a Job (Admin) ──────────────────────────────────────

/**
 * @desc   Get all applications for a specific job
 * @route  GET /api/v1/applications/job/:jobId
 * @access Private / Admin
 */
export const getApplicationsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const applications = await Application.find({ job: jobId })
    .populate({ path: 'user', select: 'name email phone' })
    .sort('-createdAt');

  res.json(
    new ApiResponse(200, applications, `Applications for "${job.title}" fetched successfully`)
  );
});

// ─── Update Application Status (Admin) ───────────────────────────────────────

/**
 * @desc   Update the status of an application
 * @route  PATCH /api/v1/applications/:id/status
 * @access Private / Admin
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Selected'];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found');

  application.status = status;
  await application.save();

  res.json(new ApiResponse(200, application, 'Application status updated successfully'));
});
