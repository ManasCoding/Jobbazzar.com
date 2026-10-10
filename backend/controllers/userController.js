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

// ─── Administrator Management (Super Admin & Admin Access Control) ─────────────

/**
 * @desc   Get all administrators
 * @route  GET /api/v1/users/admins
 * @access Private (Admin only)
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' })
    .select('name email role createdAt updatedAt')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, admins, 'Admins retrieved successfully'));
});

/**
 * @desc   Create a new administrator account
 * @route  POST /api/v1/users/admins
 * @access Private (Admin only)
 */
export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Full name, email address, and temporary password are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    if (existingUser.role === 'admin') {
      throw new ApiError(409, 'An administrator account with this email already exists');
    }
    // Upgrade existing user to admin
    existingUser.role = 'admin';
    existingUser.name = name.trim();
    existingUser.password = password; // Will be hashed by pre-save hook
    await existingUser.save();
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        'User upgraded to Administrator successfully'
      )
    );
  }

  const newAdmin = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: 'admin',
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
        updatedAt: newAdmin.updatedAt,
      },
      'Admin access granted successfully'
    )
  );
});

/**
 * @desc   Revoke / Delete administrator account
 * @route  DELETE /api/v1/users/admins/:id
 * @access Private (Admin only)
 */
export const deleteAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user._id.toString() === id.toString()) {
    throw new ApiError(400, 'You cannot revoke your own administrator account');
  }

  const adminUser = await User.findById(id);
  if (!adminUser) {
    throw new ApiError(404, 'Administrator account not found');
  }

  // Delete or revoke
  await User.findByIdAndDelete(id);

  res.json(new ApiResponse(200, null, 'Administrator account removed successfully'));
});
