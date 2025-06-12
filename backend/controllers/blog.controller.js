// controllers/blogController.js
const Blog = require('../models/Blog');
const slugify = require('slugify');


exports.createBlog = async (req, res, next) => {
  try {
    const {
      title,
      description,
      tags ,
      content, 
      allowComments, 
      coverImage,  
      isDraft
              
    } = req.body;

    const parsedTags     = JSON.parse(tags);
    const parsedContent  = JSON.parse(content);
    const draft          = isDraft === 'true';
    const commentsAllowed = allowComments === 'true';

    const existingTags = await Tag.find({ _id: { $in: parsedTags } }).select('_id');
    if (existingTags.length !== parsedTags.length) {
      const foundIds   = existingTags.map(t => t._id.toString());
      const invalidIds = parsedTags.filter(id => !foundIds.includes(id));
      return res
        .status(400)
        .json({ error: `Invalid tag IDs: ${invalidIds.join(', ')}` });
    }

    const newPost = new Blog({
        title:       title.trim(),
        slug:        slugify(title, { lower: true, strict: true }),
        description: description.trim(),
        content:     parsedContent,
        tags:        parsedTags,
        allowComments: commentsAllowed,
        coverImage:  coverImageUrl,
        userId:      req.user._id,
        isPublished: !draft,
        publishedAt: draft ? undefined : new Date()
      });

    await newPost.save();

    res.status(201).json({
      message: 'Blog post created successfully',
      post: newPost
    });
  } catch (err) {
   
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(409).json({ error: 'A post with that slug already exists.' });
    }
    next(err);
  }
};
