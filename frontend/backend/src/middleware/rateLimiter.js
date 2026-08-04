const rateLimit = require('express-rate-limit');

/**
 * Standard API Rate Limiter
 * 100 requests per 15 minutes window
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: [],
  },
});

/**
 * Strict Auth Rate Limiter
 * 20 requests per 15 minutes window
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    errors: [],
  },
});

/**
 * AI Chat Rate Limiter
 * 30 requests per 15 minutes window
 */
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI Chat request limit reached, please try again after 15 minutes',
    errors: [],
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  chatLimiter,
};
