const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token containing userId and email.
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} email - User's email address
 * @returns {string} JWT Token string
 */
const DEFAULT_JWT_SECRET = 'founderos_jwt_secret_key_super_secure_2026_change_in_production';

const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
