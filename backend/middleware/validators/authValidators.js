const { body, param,validationResult } = require('express-validator');


const validateUserRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  body('name')
    .notEmpty().withMessage('Name is required'),

  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 10 }).withMessage('Username must be at least 10 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .withMessage('Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char'),

  body('accepted')
    .custom(value => {
      if (!value) {
        throw new Error('You must accept the terms');
      }
      return true;
    })
];

const validateLoginRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  body('password')
    .notEmpty().withMessage('Password is required')
];
const validateForgotPassword = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
];

const validateResetPassword = [
  param('token')
    .notEmpty().withMessage('Token is required'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const validateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};



module.exports = {
    validateUserRules,
    validateLoginRules,
    validateForgotPassword,
    validateResetPassword,
    validateUser
  };
  