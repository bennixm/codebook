const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const {createBlog} = require('../controllers/blog.controller');
const {createBlogRules,validateBlog} = require('../middleware/validators/blogValidators');
const {validateBlogCoverImage,validateBlogContentImages}= require('../middleware/imageUpload')
router.post('/create',auth,validateBlogCoverImage(),validateBlogContentImages,createBlogRules,validateBlog,createBlog);
module.exports = router