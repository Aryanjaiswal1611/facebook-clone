const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'friend_request', 'friend_accept', 'message', 'post', 'share', 'mention'],
    required: true 
  },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  text: { type: String, default: '' },
  seen: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
