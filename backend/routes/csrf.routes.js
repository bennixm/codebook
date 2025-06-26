const express = require('express');
const router = express.Router();

router.get('/csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
