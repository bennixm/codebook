// routes/user.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { userProfile} = require('../controllers/user.controller');
router.get('/profile', auth, userProfile);

module.exports = router;
