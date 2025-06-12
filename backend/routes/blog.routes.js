const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const {createBlog} = require('../controllers/blog.controller');
const {createBlogRules} = require('../middleware/validators/blogValidators');
router.post('/create-blog',auth,createBlogRules,createBlog);
module.exports = router