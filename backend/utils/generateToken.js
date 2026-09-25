import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT and sets it as an HTTP-only cookie.
 *
 * @param {object} res - Express response object
 * @param {string} id - MongoDB ObjectId of the user
 */
const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token; // Return token just in case we need it elsewhere
};

export default generateToken;
