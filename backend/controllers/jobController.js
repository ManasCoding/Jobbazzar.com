import Job from '../models/Job.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Get All Jobs ─────────────────────────────────────────────────────────────

/**
 * @desc   Get all active jobs with filters, search, and pagination
 * @route  GET /api/v1/jobs
 * @access Public
 */
export const getAllJobs = asyncHandler(async (req, res) => {
  const {
    search,
    jobType,
    workMode,
    experience,
    industry,
    location,
    company,
    isFeatured,
    page = 1,
    limit = 10,
    sortBy = '-createdAt',
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (jobType) filter.jobType = jobType;
  if (workMode) filter.workMode = workMode;
  if (experience) filter.experience = experience;
  if (industry) filter.industry = industry;
  if (location) filter.location = location;
  if (company) filter.company = company;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('company', 'name logo city')
      .populate('location', 'name')
      .populate('industry', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Job.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
      'Jobs fetched successfully'
    )
  );
});

// ─── Get Single Job ───────────────────────────────────────────────────────────

/**
 * @desc   Get a single job by ID
 * @route  GET /api/v1/jobs/:id
 * @access Public
 */
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'name logo description website city')
    .populate('location', 'name city')
    .populate('industry', 'name')
    .populate('postedBy', 'name email');

  if (!job) throw new ApiError(404, 'Job not found');

  res.json(new ApiResponse(200, job, 'Job fetched successfully'));
});

// ─── Create Job ───────────────────────────────────────────────────────────────

/**
 * @desc   Create a new job listing
 * @route  POST /api/v1/jobs
 * @access Private / Admin
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    title, description, company, location, industry,
    jobType, workMode, experience, salaryMin, salaryMax,
    salaryNegotiable, skills, openings, applicationDeadline,
  } = req.body;

  if (!title || !description || !company || !location || !jobType || !experience) {
    throw new ApiError(400, 'Title, description, company, location, job type, and experience are required');
  }

  const job = await Job.create({
    title, description, company, location, industry,
    jobType, workMode, experience, salaryMin, salaryMax,
    salaryNegotiable, skills, openings, applicationDeadline,
    postedBy: req.user._id,
  });

  const populatedJob = await job.populate([
    { path: 'company', select: 'name logo city' },
    { path: 'location', select: 'name' },
  ]);

  res.status(201).json(new ApiResponse(201, populatedJob, 'Job created successfully'));
});

// ─── Update Job ───────────────────────────────────────────────────────────────

/**
 * @desc   Update a job listing
 * @route  PUT /api/v1/jobs/:id
 * @access Private / Admin
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('company', 'name logo city')
    .populate('location', 'name');

  res.json(new ApiResponse(200, updatedJob, 'Job updated successfully'));
});

// ─── Delete Job ───────────────────────────────────────────────────────────────

/**
 * @desc   Delete a job listing
 * @route  DELETE /api/v1/jobs/:id
 * @access Private / Admin
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');

  await job.deleteOne();

  res.json(new ApiResponse(200, null, 'Job deleted successfully'));
});
