const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const {createBlog, fetchBlogsByUser , fetchBlogBySlug} = require('../controllers/blog.controller');
const {createBlogRules,validateBlog} = require('../middleware/validators/blogValidators');
const {validateBlogCoverImage,validateBlogContentImages}= require('../middleware/imageUpload')
router.post('/create',auth,validateBlogCoverImage(),validateBlogContentImages,createBlogRules,validateBlog,createBlog);
router.get('/my-blogs', auth, fetchBlogsByUser);
router.get('/get-blog/:slug', fetchBlogBySlug);

module.exports = router