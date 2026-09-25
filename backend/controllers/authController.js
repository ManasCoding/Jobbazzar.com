import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Register ────────────────────────────────────────────────────────────────

/**
 * @desc   Register a new user
 * @route  POST /api/v1/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone });

  const token = generateToken(res, user._id);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'Account created successfully'
    )
  );
});

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @desc   Authenticate user and return token in cookie
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(res, user._id);

  res.json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'Logged in successfully'
    )
  );
});

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * @desc   Logout user and clear cookie
 * @route  POST /api/v1/auth/logout
 * @access Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * @desc   Get logged-in user's profile
 * @route  GET /api/v1/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, user, 'User profile fetched'));
});
