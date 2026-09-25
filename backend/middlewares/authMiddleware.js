import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * protect
 * Verifies the JWT in the HttpOnly cookie.
 * Attaches the full user document (minus password) to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  // Fallback for API clients sending Bearer token
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError(401, 'Not authorized — user no longer exists');
  }

  req.user = user;
  next();
});

/**
 * authorizeRoles
 * Role-based access control factory.
 * Usage: router.delete('/jobs/:id', protect, authorizeRoles('admin'), deleteJob)
 *
 * @param {...string} roles - Allowed roles
 */
export const authorizeRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  });
