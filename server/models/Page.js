const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  coverPicture: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  category: { type: String, default: 'General' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
