import User from '../models/User.js';
import SavedJob from '../models/SavedJob.js';
import SavedCompany from '../models/SavedCompany.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Get My Profile ───────────────────────────────────────────────────────────

/**
 * @desc   Get the logged-in user's full profile
 * @route  GET /api/v1/users/me
 * @access Private
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

// ─── Update My Profile ────────────────────────────────────────────────────────

/**
 * @desc   Update the logged-in user's profile
 * @route  PUT /api/v1/users/me
 * @access Private
 */
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, skills, experience, education, linkedin, github, portfolio } =
    req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  // Only update provided fields
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (skills !== undefined) user.skills = skills;
  if (experience !== undefined) user.experience = experience;
  if (education !== undefined) user.education = education;
  if (linkedin !== undefined) user.linkedin = linkedin;
  if (github !== undefined) user.github = github;
  if (portfolio !== undefined) user.portfolio = portfolio;

  const updatedUser = await user.save();

  res.json(
    new ApiResponse(200, { ...updatedUser.toObject(), password: undefined }, 'Profile updated successfully')
  );
});

// ─── Get My Saved Jobs ────────────────────────────────────────────────────────

/**
 * @desc   Get all jobs saved by the logged-in user
 * @route  GET /api/v1/users/saved-jobs
 * @access Private
 */
export const getMySavedJobs = asyncHandler(async (req, res) => {
  const savedJobs = await SavedJob.find({ user: req.user._id }).populate({
    path: 'job',
    populate: [
      { path: 'company', select: 'name logo city' },
      { path: 'location', select: 'name' },
    ],
  });

  res.json(new ApiResponse(200, savedJobs, 'Saved jobs fetched successfully'));
});

// ─── Save a Job ───────────────────────────────────────────────────────────────

/**
 * @desc   Save a job for later
 * @route  POST /api/v1/users/saved-jobs/:jobId
 * @access Private
 */
export const saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const exists = await SavedJob.findOne({ user: req.user._id, job: jobId });
  if (exists) throw new ApiError(409, 'Job is already saved');

  const saved = await SavedJob.create({ user: req.user._id, job: jobId });

  res.status(201).json(new ApiResponse(201, saved, 'Job saved successfully'));
});

// ─── Unsave a Job ─────────────────────────────────────────────────────────────

/**
 * @desc   Remove a job from saved list
 * @route  DELETE /api/v1/users/saved-jobs/:jobId
 * @access Private
 */
export const unsaveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const saved = await SavedJob.findOneAndDelete({ user: req.user._id, job: jobId });
  if (!saved) throw new ApiError(404, 'Saved job not found');

  res.json(new ApiResponse(200, null, 'Job removed from saved list'));
});

// ─── Get My Saved Companies ───────────────────────────────────────────────────

/**
 * @desc   Get all companies saved by the logged-in user
 * @route  GET /api/v1/users/saved-companies
 * @access Private
 */
export const getMySavedCompanies = asyncHandler(async (req, res) => {
  const savedCompanies = await SavedCompany.find({ user: req.user._id }).populate({
    path: 'company',
    select: 'name logo city industry isHiring',
    populate: { path: 'industry', select: 'name' },
  });

  res.json(new ApiResponse(200, savedCompanies, 'Saved companies fetched successfully'));
});
