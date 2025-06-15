const express = require('express');
const router = express.Router();
const { createUser,loginUser,logoutUser,activateUser,resendActivation,resetPassword,forgotPassword,googleCallback } = require('../controllers/auth.controller');
const { validateUserRules,validateLoginRules,validateForgotPassword,validateResetPassword, validateUser } = require('../middleware/validators/authValidators');
const rateLimit = require('express-rate-limit');
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many password reset attempts. Please try again later.'
  });
router.post('/register', validateUserRules, validateUser, createUser);
router.post('/login',validateLoginRules,loginUser); 
router.post('/logout', logoutUser);
router.get('/activate/:userId/:token', activateUser);
router.post('/resend-activation', resendActivation);

router.post('/forgot-password',forgotPasswordLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/', validateResetPassword, resetPassword);
router.get('/google/callback',googleCallback);

module.exports = router;
