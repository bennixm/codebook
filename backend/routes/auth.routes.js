const express = require('express');
const router = express.Router();
const { createUser,loginUser } = require('../controllers/auth.controller');
const { validateUserRules,validateLoginRules, validateUser } = require('../middleware/validateAuth');
router.post('/register', validateUserRules, validateUser, createUser);
router.post('/login',validateLoginRules,loginUser); 
module.exports = router;
