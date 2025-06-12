// controllers/blogController.js
const Blog    = require('../models/Blog');
const Tag     = require('../models/Tag');
const slugify = require('slugify');
const admin   = require('../firebase');
const bucket  = admin.storage().bucket();
const { generateUniqueSlug } = require('../utils/slug');

exports.createBlog = async (req, res, next) => {
  try {
    // Debugging: ensure req.user and req.body are present
    console.log('👤 req.user:', req.user);
    console.log('📦 req.body:', req.body);

    const {
      title,
      description,
      tags,
      content,
      allowComments,
      isDraft
    } = req.body;

    // Determine author ID (handle different auth shapes)
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }

    const parsedTags    = JSON.parse(tags);
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    const draft         = isDraft === 'true';
    const commentsAllowed = allowComments === 'true';

    // Validate tags exist
    const existingTags = await Tag.find({ _id: { $in: parsedTags } }).select('_id');
    if (existingTags.length !== parsedTags.length) {
      const foundIds   = existingTags.map(t => t._id.toString());
      const invalidIds = parsedTags.filter(id => !foundIds.includes(id));
      return res.status(400).json({ error: `Invalid tag IDs: ${invalidIds.join(', ')}` });
    }

    // Generate slug and initialize new post
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

    // Handle cover image (req.fileBuffer populated by middleware)
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

    // Process EditorJS image blocks
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

    await newPost.save();

    res.status(201).json({
      message: 'Blog post created successfully',
      post:    newPost
    });
  } catch (err) {
    console.error('❌ createBlog error:', err);
    if (err.name === 'ValidationError') {
      // Mongoose schema validation error
      return res.status(400).json({ errors: err.errors });
    }
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(409).json({ error: 'A post with that slug already exists.' });
    }
    next(err);
  }
};
