// validators/blogValidators.js
const { body, validationResult } = require('express-validator');

const createBlogRules = [
  
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .escape()
    .isLength({ min: 5, max: 100 }).withMessage('Title must be 5–100 characters'),


  body('description')
    .notEmpty().withMessage('Description is required')
    .trim()
    .escape()
    .isLength({ min: 10, max: 300 }).withMessage('Description must be 10–300 characters'),

 
  body('tags')
    .notEmpty().withMessage('Tags are required')
    .custom((value) => {
      let arr;
      try {
        arr = JSON.parse(value);
      } catch {
        throw new Error('Tags must be a valid JSON array');
      }
      if (!Array.isArray(arr) || arr.length < 1) {
        throw new Error('Select at least one tag');
      }
      return true;
    }),

    body('categories')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Category must be a valid ID'),

    
  body('content')
    .notEmpty().withMessage('Content is required')
    .custom((value) => {
      let data;
      try {
        data = JSON.parse(value);
      } catch {
        throw new Error('Content must be valid JSON');
      }
      const blocks = Array.isArray(data.blocks) ? data.blocks : [];
      if (blocks.length > 20) {
        throw new Error('You can add a maximum of 20 blocks');
      }
      const imgCount = blocks.filter(b => b.type === 'image').length;
      if (imgCount > 10) {
        throw new Error('You can add a maximum of 10 image blocks');
      }
      return true;
    }),

 body('isDraft')
    .notEmpty().withMessage('Draft flag is required')
    .isBoolean().withMessage('Draft flag must be true or false'),
 
  body('allowComments')
    .notEmpty().withMessage('Allow Comments is required')
    .isBoolean().withMessage('Allow Comments must be true or false'),


  body('coverImage')
    .custom((_, { req }) => {
      if (!req.file) {
        throw new Error('Cover image is required');
      }
      return true;
    }),
];
const validateAddComment = [

    body('text')
      .trim()
      .escape()
      .notEmpty().withMessage('Comment text is required.')
      .isLength({ max: 500 }).withMessage('Comment text must be at most 500 characters.'),
  
      (req, res, next) => {
        if (!req.user) {
          const guestName = req.guest?.guestName;
          if (!guestName || typeof guestName !== 'string' || !guestName.trim()) {
            return res.status(400).json({
              errors: [{
                msg: 'Guest name is required for anonymous comments.',
                param: 'guestName',
                location: 'cookie'
              }]
            });
          }
        }
        next();
      },
  
    
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];

const validateBlog = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return 422 Unprocessable Entity with array of errors
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createBlogRules,
  validateBlog,
  validateAddComment
};
