const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const {createBlog, fetchBlogsByUser , fetchBlogBySlug,deleteBlog,addComment,deleteComment,likeBlog,unlikeBlog,incrementViews} = require('../controllers/blog.controller');
const {createBlogRules,validateAddComment,validateBlog} = require('../middleware/validators/blogValidators');
const {validateBlogCoverImage,validateBlogContentImages}= require('../middleware/imageUpload')
router.post('/create',auth,validateBlogCoverImage(),validateBlogContentImages,createBlogRules,validateBlog,createBlog);
router.get('/my-blogs', auth, fetchBlogsByUser);
router.get('/get-blog/:slug', authOptional, fetchBlogBySlug);
router.delete('/delete/:id', auth, deleteBlog);
router.post('/add-comment',validateAddComment,addComment);
router.delete('/delete-comment/:id', auth,deleteComment);
router.post('/views/:id',incrementViews);
router.post('/like/:id',   auth, likeBlog);
router.post('/unlike/:id', auth, unlikeBlog);


module.exports = router