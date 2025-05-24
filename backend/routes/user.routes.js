// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/create.user.controller');
const { validateUserRules, validateUser } = require('../middleware/validateUser');
router.post('/register', validateUserRules, validateUser, createUser);

module.exports = router;
