/**
 * Custom operational error class.
 * Extends the native Error with an HTTP statusCode and an isOperational flag
 * so the global error handler can distinguish expected errors from bugs.
 *
 * Usage:
 *   throw new ApiError(404, 'User not found');
 *   throw new ApiError(400, 'Validation failed', ['email is required']);
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} [message='Something went wrong'] - Human-readable message
   * @param {Array}  [errors=[]] - Optional array of validation / field errors
   * @param {string} [stack='']  - Optional stack trace override
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.isOperational = true; // marks it as a known, handled error

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
