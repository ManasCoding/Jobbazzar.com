/**
 * Uniform success response wrapper.
 * Every successful API response follows the same shape:
 *   { success: true, statusCode, message, data }
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*}      data       - Response payload
   * @param {string} [message='Success'] - Human-readable message
   */
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
