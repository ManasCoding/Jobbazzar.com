import ApiError from '../utils/ApiError.js';

/**
 * notFound
 * Catches requests that don't match any registered route and
 * forwards a 404 ApiError to the global error handler.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found — ${req.method} ${req.originalUrl}`));
};

/**
 * errorHandler
 * Global error handling middleware.
 * Must be the LAST middleware registered in server.js.
 *
 * Handles:
 *  - ApiError instances (operational / expected errors)
 *  - Mongoose CastError      → 400
 *  - Mongoose ValidationError → 400 with field-level details
 *  - Mongoose duplicate key  → 409
 *  - JWT errors              → 401
 *  - Everything else         → 500
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}' — please use another value`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token — please log in again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired — please log in again';
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
