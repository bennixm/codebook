const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    enum: ['user', 'admin'],
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
module.exports = mongoose.model('User', userSchema);
