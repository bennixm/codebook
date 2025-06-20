// routes/user.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const authOptional = require('../middleware/auth/optionalAuthMiddleware');
const {validateProfile,validatePasswordChange,validateBio,validateSetPassword} = require('../middleware/validators/userValidators');
const {validateProfileImage}= require('../middleware/imageUpload')
const {getProfile,updateProfile,changePassword,setBio,followUser,unfollowUser,getFollowers,getFollowing,setPassword, getProfileByUsername} = require('../controllers/user.controller');
router.get('/profile', auth, getProfile);
router.post('/update-profile', auth,validateProfileImage(),validateProfile, updateProfile);
router.post('/change-password', auth, validatePasswordChange, changePassword);
router.post('/set-bio',auth,validateBio,setBio);
router.post('/follow/:id',   auth, followUser);
router.post('/unfollow/:id', auth, unfollowUser);
router.get('/followers/:id', auth, getFollowers);
router.get('/following/:id', auth, getFollowing);
router.post('/set-password', auth, validateSetPassword, setPassword);
router.get('/get-profile/:username', authOptional, getProfileByUsername);



  
  




module.exports = router;
