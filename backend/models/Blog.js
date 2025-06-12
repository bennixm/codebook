const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
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
 
  tags: [
       {
         type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
         default: []
       }
     ],

  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Pre-save hook to auto-generate excerpt and calculate reading time
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.excerpt = this.content.slice(0, 200) + '...';
    const words = this.content.split(/\s+/).length;
    // Assuming average reading speed of 200 wpm
    this.readingTime = Math.ceil(words / 200);
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
