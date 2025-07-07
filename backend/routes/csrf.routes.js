const express = require('express');
const router = express.Router();
const csrfProtection = require('../middleware/csrf');

router.get('/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
