const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
  } catch (err) {
    console.warn('⚠️ Invalid token ignored:', err.message);
  }
  next();
};
