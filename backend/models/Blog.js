const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
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
 
  tags: [
       {
         type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
         default: []
       }
     ],

     comments: [
      {
        userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        guestId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
        text:      { type: String, required: true },
        createdAt: { type: Date,   default: Date.now },
        replyid:   { type: mongoose.Schema.Types.ObjectId }
      }
    ],
  allowComments: {
    type: Boolean,
    default: true
  },
  views: [
    {
      userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      guestId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
      at:        { type: Date,   default: Date.now }
    }
  ],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  readingTime: {
    type: Number
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  updatedAt: { type: Date, default: null },

}, { timestamps: { createdAt: true, updatedAt: false } });

blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    let blocks = []

    // 1) get the blocks array, whether content is stored as a string or object
    if (typeof this.content === 'string') {
      try {
        blocks = JSON.parse(this.content).blocks || []
      } catch (e) {
        blocks = []
      }
    } else if (this.content && Array.isArray(this.content.blocks)) {
      blocks = this.content.blocks
    }

    // 2) extract *only* the text from each block
    const textSegments = blocks
      .filter(b => {
        // include any block types that carry human‐readable text
        return b.type === 'text' || b.type === 'header' || b.type === 'paragraph'
      })
      .map(b => {
        // for each block, pull out whichever field holds the text
        if (typeof b.data.text === 'string')         return b.data.text
        if (typeof b.data.caption === 'string')      return b.data.caption
        if (typeof b.data.description === 'string')  return b.data.description
        return ''
      })

    const fullText = textSegments.join(' ').trim()

    // 3) generate the excerpt (first 200 chars) and readingTime
    this.excerpt = fullText.length > 200
      ? fullText.slice(0, 200) + '…'
      : fullText

    const wordCount = fullText.split(/\s+/).filter(Boolean).length
    this.readingTime = Math.ceil(wordCount / 200)
  }

  next()
})


module.exports = mongoose.model('Blog', blogSchema);
