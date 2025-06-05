const { body, validationResult } = require('express-validator');

const validateProfile = [
  body('name')
    .notEmpty().withMessage('Name is required'),

  body('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),

  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg  
      });
    }
    next();
  }
];

module.exports = {
  validateProfile
};
