const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
    trim: true
  },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

 
  role: {
    type: String,
    enum: ['user', 'admin', 'author'],
    default: 'user'
  },

 
  isVerified: {
    type: Boolean,
    default: false
  },

  
  avatar: {
    type: String, 
    default: ''
  },

  bio: {
    type: String,
    default: ''
  },

  location: {
    type: String,
    default: ''
  },

  // Social Links
  social: {
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },

  
  resetToken: String,
  resetTokenExpires: Date,

  postsCount: {
    type: Number,
    default: 0
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
