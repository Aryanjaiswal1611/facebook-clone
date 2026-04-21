const User = require('../models/User');

const userController = {
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserByUsername: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username }).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const updates = req.body;
      delete updates.password;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  searchUsers: async (req, res) => {
    try {
      const { q } = req.query;
      const users = await User.find({
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } }
        ]
      }).select('_id firstName lastName username profilePicture').limit(20);

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  sendFriendRequest: async (req, res) => {
    try {
      const userId = req.userId;
      const targetUserId = req.params.id;

      if (userId === targetUserId) {
        return res.status(400).json({ message: 'Cannot send friend request to yourself' });
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (targetUser.friendRequests.includes(userId)) {
        return res.status(400).json({ message: 'Friend request already sent' });
      }

      if (targetUser.friends.includes(userId)) {
        return res.status(400).json({ message: 'Already friends' });
      }

      await User.findByIdAndUpdate(targetUserId, { $push: { friendRequests: userId } });
      await User.findByIdAndUpdate(userId, { $push: { sentRequests: targetUserId } });

      res.json({ message: 'Friend request sent' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  acceptFriendRequest: async (req, res) => {
    try {
      const userId = req.userId;
      const requesterId = req.params.id;

      const user = await User.findById(userId);
      if (!user.friendRequests.includes(requesterId)) {
        return res.status(400).json({ message: 'No friend request from this user' });
      }

      await User.findByIdAndUpdate(userId, {
        $pull: { friendRequests: requesterId, sentRequests: requesterId },
        $addToSet: { friends: requesterId }
      });

      await User.findByIdAndUpdate(requesterId, {
        $pull: { sentRequests: userId, friendRequests: userId },
        $addToSet: { friends: userId }
      });

      res.json({ message: 'Friend request accepted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  rejectFriendRequest: async (req, res) => {
    try {
      const userId = req.userId;
      const requesterId = req.params.id;

      await User.findByIdAndUpdate(userId, {
        $pull: { friendRequests: requesterId }
      });

      await User.findByIdAndUpdate(requesterId, {
        $pull: { sentRequests: userId }
      });

      res.json({ message: 'Friend request rejected' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  unfriend: async (req, res) => {
    try {
      const userId = req.userId;
      const friendId = req.params.id;

      await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
      await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

      res.json({ message: 'Unfriended successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getFriends: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate('friends', '_id firstName lastName username profilePicture');

      res.json(user.friends);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getFriendRequests: async (req, res) => {
    try {
      const user = await User.findById(req.userId)
        .populate('friendRequests', '_id firstName lastName username profilePicture');

      res.json(user.friendRequests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  followUser: async (req, res) => {
    try {
      const userId = req.userId;
      const targetUserId = req.params.id;

      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: userId } });
      await User.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } });

      res.json({ message: 'Followed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const userId = req.userId;
      const targetUserId = req.params.id;

      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });

      res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userController;
