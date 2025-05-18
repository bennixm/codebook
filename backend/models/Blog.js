const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  content: {
    type: String,
    required: true
  },

  excerpt: {
    type: String,
    default: ''
  },

  coverImage: {
    type: String, 
    default: ''
  },


  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  
  category: {
    type: String,
    default: 'General'
  },

  tags: {
    type: [String],
    default: []
  },

  
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  
  views: {
    type: Number,
    default: 0
  },

  likes: {
    type: Number,
    default: 0
  },


  readingTime: {
    type: Number 
  },

  
  isPublished: {
    type: Boolean,
    default: false
  },

  publishedAt: {
    type: Date
  }

}, {
  timestamps: true 
});

module.exports = mongoose.model('Blog', blogSchema);
