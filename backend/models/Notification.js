const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
  actorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actorGuest: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Guest'
  },
  type: {
    type: String,
    enum: ['comment', 'reply', 'like', 'follow','view','new_blog'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['Blog', 'Comment', 'User', 'Guest'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
