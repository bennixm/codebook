const Blog    = require('../models/Blog');
const Tag     = require('../models/Tag');
const slugify = require('slugify');
const admin   = require('../firebase');
const bucket  = admin.storage().bucket();
const { generateUniqueSlug } = require('../utils/slug');
const { sendBlogCreatedEmail } = require('../services/mailService');
const { extractFirebasePath }   = require('../utils/extract-firebase-path');

exports.createBlog = async (req, res, next) => {
  try {

    const {
      title,
      description,
      tags,
      content,
      allowComments,
      isDraft
    } = req.body;

    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }

    const parsedTags    = JSON.parse(tags);
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    const draft         = isDraft === 'true';
    const commentsAllowed = allowComments === 'true';

    const existingTags = await Tag.find({ _id: { $in: parsedTags } }).select('_id');
    if (existingTags.length !== parsedTags.length) {
      const foundIds   = existingTags.map(t => t._id.toString());
      const invalidIds = parsedTags.filter(id => !foundIds.includes(id));
      return res.status(400).json({ error: `Invalid tag IDs: ${invalidIds.join(', ')}` });
    }

    const uniqueSlug = await generateUniqueSlug(title);
    const newPost = new Blog({
      title:        title.trim(),
      slug:         uniqueSlug,
      description:  description.trim(),
      tags:         parsedTags,
      allowComments: commentsAllowed,
      isPublished:  !draft,
      publishedAt:  draft ? undefined : new Date(),
      userId        // ES6 shorthand
    });
    const blogId = newPost._id.toString();

    if (req.fileBuffer && req.fileMeta) {
      const { mime, ext } = req.fileMeta;
      const filePath = `blogs/${blogId}/cover/cover_${Date.now()}.${ext}`;
      const file = bucket.file(filePath);
      await file.save(req.fileBuffer, {
        metadata: { contentType: mime },
        public: true,
      });
      newPost.coverImage = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }

    if (parsedContent.blocks) {
      newPost.content = JSON.stringify({
        ...parsedContent,
        blocks: await Promise.all(
          parsedContent.blocks.map(async blk => {
            if (blk.type === 'image' && blk.data?.file?.url?.startsWith('data:')) {
              const match = blk.data.file.url.match(/^data:(.+);base64,(.+)$/);
              const mime = match[1];
              const data = Buffer.from(match[2], 'base64');
              const ext  = mime.split('/')[1];
              const filePath = `blogs/${blogId}/content/${blk.id}_${Date.now()}.${ext}`;
              const file     = bucket.file(filePath);
              await file.save(data, { metadata: { contentType: mime }, public: true });
              blk.data.file.url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            }
            return blk;
          })
        )
      });
    }

    //await newPost.save();
    const savedPost = await newPost.save();
    await savedPost.populate({ path: 'userId', select: 'name email' });
    await sendBlogCreatedEmail(savedPost.userId, savedPost);

    res.status(201).json({
      message: 'Blog post created successfully',
      post:    savedPost
    });
  } catch (err) {
    console.error('❌ createBlog error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(409).json({ error: 'A post with that slug already exists.' });
    }
    next(err);
  }
};

exports.fetchBlogsByUser = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }

    const blogs = await Blog.find({ userId })
      .populate('tags', 'name')
      .sort({ createdAt: -1 }) 
      .select('title slug description coverImage tags isPublished publishedAt createdAt');

    res.status(200).json(blogs);
  } catch (err) {
    console.error('❌ fetchBlogsByUser error:', err);
    next(err);
  }
};
exports.deleteBlog = async (req, res, next) => {
    try {
      const blogId = req.params.id;
      const userId = req.user._id || req.user.id;
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: missing user ID' });
      }
  
      
      const blog = await Blog.findOne({ _id: blogId, userId });
      if (!blog) {
        return res.status(404).json({ error: 'Blog post not found or no permission to delete.' });
      }
  
      
      if (blog.coverImage) {
        const coverPath = extractFirebasePath(blog.coverImage);
        if (coverPath) {
          try {
            await bucket.file(coverPath).delete();
          } catch (err) {
            console.warn('⚠️ Failed to delete cover image:', err.message);
          }
        }
      }
  
     
      if (blog.content) {
        const contentObj =
          typeof blog.content === 'string'
            ? JSON.parse(blog.content)
            : blog.content;
  
        if (Array.isArray(contentObj.blocks)) {
          for (const blk of contentObj.blocks) {
            if (blk.type === 'image' && blk.data?.file?.url) {
              const imgPath = extractFirebasePath(blk.data.file.url);
              if (imgPath) {
                try {
                  await bucket.file(imgPath).delete();
                } catch (err) {
                  console.warn('⚠️ Failed to delete block image:', err.message);
                }
              }
            }
          }
        }
      }
 
      await blog.deleteOne();
  
      res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (err) {
      console.error('❌ deleteBlog error:', err);
      next(err);
    }
  };

exports.fetchBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const userId = req.user?.id || req.user?._id;

    const blog = await Blog.findOne({ slug })
      .populate('tags', 'name')
      .populate('userId', 'name username avatar');

    const isPublished = blog.isPublished;

    let isOwner = false;
  
    if(userId){
      isOwner = blog.userId._id.toString() === userId.toString();
    }


    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (!isOwner && !isPublished) {
      return res.status(403).json({ error: 'You are not allowed to view this.' });
    }


    res.status(200).json(blog);
  } catch (err) {
    console.error('❌ fetchBlogBySlug error:', err);
    next(err);
  }
};

