const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token containing userId and email.
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} email - User's email address
 * @returns {string} JWT Token string
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
