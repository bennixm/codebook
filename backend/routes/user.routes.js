// routes/user.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const {validateProfile,validatePasswordChange} = require('../middleware/validators/userValidators');
const {validateProfileImage}= require('../middleware/imageUpload')
const {getProfile,updateProfile,changePassword} = require('../controllers/user.controller');
router.get('/profile', auth, getProfile);
router.post('/update-profile', auth,validateProfileImage(),validateProfile, updateProfile);
router.post('/change-password', auth, validatePasswordChange, changePassword);


  
  




module.exports = router;
