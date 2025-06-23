const Blog = require('../models/Blog');
const Tag = require('../models/Tag');
const Guest = require('../models/Guest');
const User = require('../models/User');
const Category = require('../models/Category');
const slugify = require('slugify');
const admin = require('../firebase');
const bucket = admin.storage().bucket();
const { generateUniqueSlug } = require('../utils/slug');
const { sendBlogCreatedEmail } = require('../services/mailService');
const { extractFirebasePath } = require('../utils/extract-firebase-path');
const { createNotification } = require('../services/notificationService');



exports.createBlog = async (req, res, next) => {
  try {

    const {
      title,
      description,
      tags,
      categories,
      content,
      allowComments,
      isDraft
    } = req.body;

    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }

    const parsedTags = JSON.parse(tags);
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    const draft = isDraft === 'true';
    const commentsAllowed = allowComments === 'true';

    const existingTags = await Tag.find({ _id: { $in: parsedTags } }).select('_id');
    if (existingTags.length !== parsedTags.length) {
      const foundIds = existingTags.map(t => t._id.toString());
      const invalidIds = parsedTags.filter(id => !foundIds.includes(id));
      return res.status(400).json({ error: `Invalid tag IDs: ${invalidIds.join(', ')}` });
    }

    const parsedCategories = [categories];
    const existingCategories = await Category.find({ _id: { $in: parsedCategories } }).select('_id');
      if (existingCategories.length !== parsedCategories.length) {
        const foundCategoryIds = existingCategories.map(c => c._id.toString());
        const invalidCategoryIds = parsedCategories.filter(id => !foundCategoryIds.includes(id));
        return res.status(400).json({ error: `Invalid category IDs: ${invalidCategoryIds.join(', ')}` });
      }

    const uniqueSlug = await generateUniqueSlug(title);
    const newPost = new Blog({
      title: title.trim(),
      slug: uniqueSlug,
      description: description.trim(),
      tags: parsedTags,
      categories: parsedCategories,
      allowComments: commentsAllowed,
      isPublished: !draft,
      publishedAt: draft ? undefined : new Date(),
      draftedAt: draft ? new Date():undefined ,
      userId        
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
              const ext = mime.split('/')[1];
              const filePath = `blogs/${blogId}/content/${blk.id}_${Date.now()}.${ext}`;
              const file = bucket.file(filePath);
              await file.save(data, { metadata: { contentType: mime }, public: true });
              blk.data.file.url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            }
            return blk;
          })
        )
      });
    }

    
    const savedPost = await newPost.save();
    await savedPost.populate({ path: 'userId', select: 'name email followers' });
    await sendBlogCreatedEmail(savedPost.userId, savedPost);

    const author = savedPost.userId;
    const followerIds = author.followers || [];



    await Promise.all(followerIds.map(followerId => {
      return createNotification({
        app: req.app,
        recipient: followerId,
        actor: author._id,
        type: 'new_blog',
        targetType: 'Blog',
        targetId: savedPost._id
      });
    }));


    res.status(201).json({
      message: 'Blog post created successfully',
      post: savedPost
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

exports.editBlog = async (req, res, next) => {
  try {
    const {
      blogid,
      title,
      description,
      tags,
      categories,
      content,
      allowComments,
      isDraft
    } = req.body;

    const userId = req.user._id || req.user.id;

    const blog = await Blog.findById(blogid);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    if (blog.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized: not your blog post' });
    }

    const parsedTags = JSON.parse(tags);
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    const draft = isDraft === 'true';
    const commentsAllowed = allowComments === 'true';

  
    const existingTags = await Tag.find({ _id: { $in: parsedTags } }).select('_id');
    if (existingTags.length !== parsedTags.length) {
      const foundIds = existingTags.map(t => t._id.toString());
      const invalidIds = parsedTags.filter(id => !foundIds.includes(id));
      return res.status(400).json({ error: `Invalid tag IDs: ${invalidIds.join(', ')}` });
    }

    const parsedCategories = [categories];
    const existingCategories = await Category.find({ _id: { $in: parsedCategories } }).select('_id');
      if (existingCategories.length !== parsedCategories.length) {
        const foundCategoryIds = existingCategories.map(c => c._id.toString());
        const invalidCategoryIds = parsedCategories.filter(id => !foundCategoryIds.includes(id));
        return res.status(400).json({ error: `Invalid category IDs: ${invalidCategoryIds.join(', ')}` });
      }

    const updateFields = {
      title: title.trim(),
      description: description.trim(),
      tags: parsedTags,
      categories: parsedCategories,
      allowComments: commentsAllowed,
      isPublished: !draft,
      updatedAt: new Date(),
      publishedAt: blog.publishedAt || new Date(),
      draftedAt: blog.draftedAt || new Date()
      
    };

    if (title.trim() !== blog.title) {
      updateFields.slug = await generateUniqueSlug(title);
    }

    
    
    

   
    if (req.fileBuffer && req.fileMeta && blog.coverImage) {
      const coverPath = decodeURIComponent(new URL(blog.coverImage).pathname).replace(`/${bucket.name}/`, '');
      await bucket.file(coverPath).delete().catch(() => {}); 
    }

    
    if (blog.content) {
      try {
        const oldContent = JSON.parse(blog.content);
        const oldImages = (oldContent.blocks || []).filter(b => b.type === 'image' && b.data?.file?.url?.startsWith('https://storage.googleapis.com'));
    
        await Promise.all(oldImages.map(async blk => {
          try {
            const url = blk.data.file.url;
            const filePath = decodeURIComponent(new URL(url).pathname).replace(`/${bucket.name}/`, '');
            await bucket.file(filePath).delete();
          } catch (err) {
            console.warn(`⚠️ Failed to delete image block:`, err.message);
          }
        }));
      } catch (parseErr) {
        console.warn('⚠️ Failed to parse previous blog content for cleanup:', parseErr.message);
      }
    }
    

   
    if (req.fileBuffer && req.fileMeta) {
      const { mime, ext } = req.fileMeta;
      const filePath = `blogs/${blogid}/cover/cover_${Date.now()}.${ext}`;
      const file = bucket.file(filePath);
      await file.save(req.fileBuffer, {
        metadata: { contentType: mime },
        public: true,
      });
      updateFields.coverImage = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }

    
    if (parsedContent.blocks) {
      updateFields.content = JSON.stringify({
        ...parsedContent,
        blocks: await Promise.all(
          parsedContent.blocks.map(async blk => {
            if (blk.type === 'image' && blk.data?.file?.url?.startsWith('data:')) {
              try {
                const match = blk.data.file.url.match(/^data:(.+);base64,(.+)$/);
                if (!match) throw new Error('Invalid base64 format in content block');
            
                const mime = match[1];
                const data = Buffer.from(match[2], 'base64');
                const ext = mime.split('/')[1];
            
                const blkId = blk.id || `block_${Date.now()}`;
                const filePath = `blogs/${blogid}/content/${blkId}_${Date.now()}.${ext}`;
                const file = bucket.file(filePath);
                await file.save(data, { metadata: { contentType: mime }, public: true });
            
                blk.data.file.url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
              } catch (err) {
                console.error(`❌ Failed to upload image block '${blk.id}':`, err.message);
                throw err;
              }
            }
            
            return blk;
          })
        )
      });
    }
    

    await Blog.updateOne({ _id: blogid }, { $set: updateFields });

    res.status(200).json({
      message: 'Blog post updated successfully',
     
    });

  } catch (err) {
    console.error('❌ editBlog error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    next(err);
  }
};



exports.fetchBlogsByUser = async (req, res, next) => {
  try {

    const { foreignUser } = req.params;
    const userId = foreignUser || req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }

    const blogs = await Blog.find({ userId })
      .populate('tags', 'name')
      .populate('userId', 'name username avatar')
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .select('title slug description coverImage tags categories isPublished publishedAt draftedAt updatedAt');

    res.status(200).json(blogs);
  } catch (err) {
    console.error('❌ fetchBlogsByUser error:', err);
    next(err);
  }
};
exports.fetchBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id)
      .populate('userId', 'name username avatar')
      .populate('tags', 'name')
      .select('-__v');

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    return res.status(200).json(blog);
  } catch (err) {
    console.error('❌ fetchBlogById error:', err);
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
      .populate('categories', 'name')
      .populate({
      path: 'userId',
      select: 'name username email avatar bio location postsCount followers following createdAt'
    });

    const isPublished = blog.isPublished;

    let isOwner = false;

    if (userId) {
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

exports.getComments = async (req, res, next) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId)
      .populate('comments.userId', 'name avatar')
      .populate('comments.guestId', 'guestName');

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const comments = blog.comments || [];

    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ comments });
  } catch (err) {
    console.error('❌ getComments error:', err);
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { text, guestName, replyid } = req.body;

    const userId = req.user?.id || req.user?._id;
    const { guestId } = req.guest;
    const isUser = Boolean(userId);

    const comment = {
      text: text.trim(),
      createdAt: new Date(),
      replyid
    };


    if (isUser) {
      comment.userId = userId;
    } else {
      res.cookie('guestName', guestName, {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365
      });

      await Guest.findOneAndUpdate(
        { _id: guestId },
        { guestName },
        { upsert: true, new: true }
      );

      comment.guestId = guestId;
      req.guest.guestName = guestName;

    }




    if (replyid) {
      const exists = await Blog.findOne({ _id: blogId, 'comments._id': replyid });
      if (!exists) {
        return res.status(400).json({ error: 'Parent comment not found.' });
      }
      comment.replyid = replyid;
    }

    const updated = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: comment } },
      { new: true, runValidators: true }
    ).populate('comments.userId', 'name avatar')
      .populate('comments.guestId', 'guestName');

    if (!updated) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }
    const isReply = Boolean(replyid);
    const notifType = isReply ? 'reply' : 'comment';



    let recipient;

    if (isReply) {

      const parent = updated.comments.find(c => c._id.toString() === replyid);
      if (!parent) {
        return res.status(400).json({ error: 'Parent comment not found.' });
      }
      if (parent.userId) {
        recipient = parent.userId._id;
      } else {

        recipient = parent.guestId._id || parent.guestId;
      }


    } else {

      recipient = updated.userId;
    }

    await createNotification({
      app: req.app,
      recipient,
      actorUser: isUser ? userId : undefined,
      actorGuest: isUser ? undefined : req.guest.guestId,
      type: isReply ? 'reply' : 'comment',
      targetType: 'Blog',
      targetId: updated._id
    });

    res.status(201).json({ comments: updated.comments });
  } catch (err) {
    console.error('❌ addComment error:', err);
    next(err);
  }
};

exports.editComment = async (req, res, next) => {
  try {
    const blogId    = req.params.id;
    const commentId = req.params.commentId;
    const { text }  = req.body;

    const userId  = req.user?.id || req.user?._id;
    const guestId = req.guest?.guestId;
    const isUser  = Boolean(userId);

    
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    
    if (
      (isUser      && comment.userId?.toString()  !== userId.toString()) ||
      (!isUser     && comment.guestId?.toString() !== guestId.toString())
    ) {
      return res.status(403).json({ error: 'Not your comment.' });
    }

   
    comment.text     = text.trim();
    comment.editedAt = new Date();

    await blog.save();

    
    const updated = await Blog.findById(blogId)
      .populate('comments.userId', 'name avatar')
      .populate('comments.guestId', 'guestName');

    res.json({ comments: updated.comments });
  } catch (err) {
    console.error('❌ editComment error:', err);
    next(err);
  }
};


exports.deleteComment = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(403).json({ error: 'Not authorized to delete comments.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const isAuthor = comment.userId?.toString() === userId.toString();
    const isOwner = blog.userId.toString() === userId.toString();
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this comment.' });
    }

    // Remove the targeted comment and its direct replies
    blog.comments = blog.comments.filter(c => {
      const isTarget = c._id.toString() === commentId;
      const isChild = c.replyid?.toString() === commentId;
      return !(isTarget || isChild);
    });

    await blog.save();
    res.status(200).json({ comments: blog.comments });
  } catch (err) {
    console.error('❌ deleteComment error:', err);
    next(err);
  }
};

exports.incrementViews = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const userId = req.user?.id || req.user?._id;
    const guestId = req.guest?.guestId;

    const viewerId = userId ?? guestId;

    if (!viewerId) {
      return res.status(400).json({ error: 'Unable to identify viewer.' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const hasViewed = blog.views.some(v => {
      return userId
        ? v.userId?.toString() === viewerId.toString()
        : v.guestId?.toString() === viewerId.toString();
    });

    if (hasViewed) {
      return res.status(200).json({
        totalViews: blog.views.length,
        viewers: blog.views
      });
    }

    const viewEntry = {
      at: new Date(),
      ...(userId
        ? { userId: viewerId }
        : { guestId: viewerId })
    };

    blog.views.push(viewEntry);
    await blog.save();

    return res.status(200).json({
      totalViews: blog.views.length,
      viewers: blog.views
    });

  } catch (err) {
    next(err);
  }
};




exports.likeBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Authentication required to like.' });

    const updated = await Blog.findByIdAndUpdate(
      blogId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Blog post not found.' });

    await createNotification({
      app: req.app,
      recipient: updated.userId,
      actor: req.user.id,
      type: 'like',
      targetType: 'Blog',
      targetId: updated._id
    });

    res.status(200).json({
      likesCount: updated.likes.length,
      likers: updated.likes
    });

  } catch (err) {
    next(err);
  }
};


exports.unlikeBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Authentication required to unlike.' });

    const updated = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { likes: userId } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Blog post not found.' });

    res.status(200).json({
      likesCount: updated.likes.length,
      likers: updated.likes
    });
  } catch (err) {
    next(err);
  }
};


exports.filterBlogs = async (req, res, next) => {
  try {
    const { tags, search, slugs, page = 1, limit = 10 } = req.query;
    const filter = { isPublished: true };

    if (slugs) {
        const slugArray = slugs.split(',');
        filter.slug = { $in: slugArray };
    }

  
    let userIds = [];
    if (search) {
 
      const users = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { username: new RegExp(search, 'i') }
        ]
      }).select('_id');
      userIds = users.map(u => u._id);

      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { userId: { $in: userIds } }
      ];
    }

    
    if (tags) {
      filter.tags = { $all: tags.split(',') };
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const perPage = Math.max(parseInt(limit, 10), 1);
    const skip = (pageNum - 1) * perPage;

    const total = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate('userId', 'name username avatar')
      .populate('tags', 'name')
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .select('title slug description content coverImage tags publishedAt');

    res.json({
      data: blogs,
      page: pageNum,
      perPage,
      totalPages: Math.ceil(total / perPage),
      total
    });
  } catch (err) {
    next(err);
  }
};



