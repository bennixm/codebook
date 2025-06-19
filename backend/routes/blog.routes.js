const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth/authMiddleware');
const authOptional = require('../middleware/auth/optionalAuthMiddleware');
const { createBlog, fetchBlogsByUser, fetchBlogBySlug, deleteBlog, addComment,editComment, deleteComment, likeBlog, unlikeBlog, incrementViews, fetchBlogById, filterBlogs, getComments,editBlog } = require('../controllers/blog.controller');
const { createBlogRules, validateAddComment, validateBlog } = require('../middleware/validators/blogValidators');
const { validateBlogCoverImage, validateBlogContentImages } = require('../middleware/imageUpload')
router.post('/create', auth, validateBlogCoverImage(), validateBlogContentImages, createBlogRules, validateBlog, createBlog);
router.post('/edit-blog/:id', auth, validateBlogCoverImage(), validateBlogContentImages,createBlogRules, validateBlog, editBlog);
router.get('/my-blogs', auth, fetchBlogsByUser);
router.get('/get-blog/:slug', authOptional, fetchBlogBySlug);
router.delete('/delete/:id', auth, deleteBlog);
router.post('/add-comment/:id', authOptional, validateAddComment, addComment);
router.post('/edit-comment/:id', authOptional, validateAddComment, editComment); 
router.delete('/delete-comment/:commentId/blog/:blogId', auth, deleteComment);
router.get('/comments/:id', getComments);
router.post('/views/:id', authOptional, incrementViews);
router.post('/like/:id', auth, likeBlog);
router.post('/unlike/:id', auth, unlikeBlog);
router.get('/get-blog-by/:id', authOptional, fetchBlogById);
router.get('/filter-blogs', authOptional, filterBlogs);
router.get('/user-blogs/:foreignUser', authOptional, fetchBlogsByUser);

module.exports = router