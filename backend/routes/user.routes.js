// routes/user.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const {validateProfile,validatePasswordChange,validateBio} = require('../middleware/validators/userValidators');
const {validateProfileImage}= require('../middleware/imageUpload')
const {getProfile,updateProfile,changePassword,setBio} = require('../controllers/user.controller');
router.get('/profile', auth, getProfile);
router.post('/update-profile', auth,validateProfileImage(),validateProfile, updateProfile);
router.post('/change-password', auth, validatePasswordChange, changePassword);
router.post('/set-bio',auth,validateBio,setBio);


  
  




module.exports = router;
