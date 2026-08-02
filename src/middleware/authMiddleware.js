const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT token.
 * Reads Authorization header formatted as 'Bearer TOKEN'.
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to request object
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized, no token provided',
    });
  }
};

module.exports = { protect };
