import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT for the given user ID.
 *
 * @param {string} id - MongoDB ObjectId of the user
 * @returns {string}  Signed JWT string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export default generateToken;
