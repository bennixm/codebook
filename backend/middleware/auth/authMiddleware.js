const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.cookies.token; // we take the data from the cookie not from header

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
