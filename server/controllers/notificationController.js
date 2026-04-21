const Notification = require('../models/Notification');

const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ recipient: req.userId })
        .sort({ createdAt: -1 })
        .populate('sender', 'firstName lastName username profilePicture')
        .populate('postId')
        .limit(50);

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        recipient: req.userId,
        seen: false
      });

      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;

      await Notification.findByIdAndUpdate(
        notificationId,
        { seen: true },
        { new: true }
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await Notification.updateMany(
        { recipient: req.userId, seen: false },
        { seen: true }
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      await Notification.findByIdAndDelete(req.params.notificationId);
      res.json({ message: 'Notification deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = notificationController;
