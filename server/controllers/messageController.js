const { Message, Conversation } = require('../models/Message');
const User = require('../models/User');

const messageController = {
  sendMessage: async (req, res) => {
    try {
      const { recipientId, text, image } = req.body;

      const message = new Message({
        sender: req.userId,
        recipient: recipientId,
        text,
        image
      });

      await message.save();

      let conversation = await Conversation.findOne({
        participants: { $all: [req.userId, recipientId] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [req.userId, recipientId],
          lastMessage: message._id,
          lastMessageAt: new Date()
        });
      } else {
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
      }

      await conversation.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'firstName lastName username profilePicture')
        .populate('recipient', 'firstName lastName username profilePicture');

      res.status(201).json(populatedMessage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getConversations: async (req, res) => {
    try {
      const conversations = await Conversation.find({
        participants: req.userId
      })
        .sort({ lastMessageAt: -1 })
        .populate('participants', 'firstName lastName username profilePicture isOnline lastSeen')
        .populate('lastMessage');

      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMessages: async (req, res) => {
    try {
      const { otherUserId } = req.params;

      const messages = await Message.find({
        $or: [
          { sender: req.userId, recipient: otherUserId },
          { sender: otherUserId, recipient: req.userId }
        ],
        deletedBy: { $ne: req.userId }
      })
        .sort({ createdAt: 1 })
        .populate('sender', 'firstName lastName username profilePicture')
        .populate('recipient', 'firstName lastName username profilePicture');

      await Message.updateMany(
        { sender: otherUserId, recipient: req.userId, seen: false },
        { seen: true }
      );

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  markAsSeen: async (req, res) => {
    try {
      const { messageId } = req.params;

      const message = await Message.findByIdAndUpdate(
        messageId,
        { seen: true },
        { new: true }
      );

      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const message = await Message.findById(req.params.messageId);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      if (message.sender.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      message.deletedBy.push(req.userId);
      await message.save();

      res.json({ message: 'Message deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = messageController;
