/**
 * Rate limiting middleware
 */

const rateLimit = require('express-rate-limit');
const config = require('../config').security.rateLimit;

/**
 * Creates a rate limiter middleware
 * Limits the number of requests a client can make in a given time window
 */
const rateLimiter = rateLimit({
  windowMs: config.windowMs,
  max: config.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

module.exports = rateLimiter;