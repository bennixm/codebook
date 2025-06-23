const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { message: 'Too many login attempts, try again later.' }
});

const commentLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3,
  message: { message: 'You are commenting too fast. Please slow down.' }
});

module.exports = {
  loginLimiter,
  commentLimiter
};
