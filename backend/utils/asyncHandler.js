/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express's next() error handler.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
