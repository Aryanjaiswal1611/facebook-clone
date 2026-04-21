const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');

const groupController = {
  createGroup: async (req, res) => {
    try {
      const { name, description, isPrivate } = req.body;

      const group = new Group({
        name,
        description,
        admin: req.userId,
        members: [req.userId],
        isPrivate
      });

      await group.save();

      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { groups: group._id }
      });

      const populatedGroup = await Group.findById(group._id)
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('members', 'firstName lastName username profilePicture');

      res.status(201).json(populatedGroup);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id)
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('members', 'firstName lastName username profilePicture');

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      res.json(group);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.admin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { name, description, coverPicture, isPrivate, isClosed } = req.body;

      group.name = name || group.name;
      group.description = description || group.description;
      group.coverPicture = coverPicture || group.coverPicture;
      group.isPrivate = isPrivate !== undefined ? isPrivate : group.isPrivate;
      group.isClosed = isClosed !== undefined ? isClosed : group.isClosed;

      await group.save();

      const updatedGroup = await Group.findById(group._id)
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('members', 'firstName lastName username profilePicture');

      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.admin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Post.deleteMany({ groupId: group._id });
      await Group.findByIdAndDelete(group._id);

      res.json({ message: 'Group deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  joinGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.members.includes(req.userId)) {
        return res.status(400).json({ message: 'Already a member' });
      }

      if (group.memberRequests.includes(req.userId)) {
        return res.status(400).json({ message: 'Request already sent' });
      }

      if (group.isPrivate) {
        group.memberRequests.push(req.userId);
        await group.save();
        return res.json({ message: 'Join request sent' });
      }

      group.members.push(req.userId);
      await group.save();

      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { groups: group._id }
      });

      res.json({ message: 'Joined group' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  leaveGroup: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.admin.toString() === req.userId) {
        return res.status(400).json({ message: 'Admin cannot leave the group' });
      }

      group.members = group.members.filter(id => id.toString() !== req.userId);
      group.memberRequests = group.memberRequests.filter(id => id.toString() !== req.userId);
      await group.save();

      await User.findByIdAndUpdate(req.userId, {
        $pull: { groups: group._id }
      });

      res.json({ message: 'Left group' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  approveJoinRequest: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);
      const userId = req.body.userId;

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.admin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (!group.memberRequests.includes(userId)) {
        return res.status(400).json({ message: 'No request from this user' });
      }

      group.memberRequests = group.memberRequests.filter(id => id.toString() !== userId);
      group.members.push(userId);
      await group.save();

      await User.findByIdAndUpdate(userId, {
        $addToSet: { groups: group._id }
      });

      res.json({ message: 'Join request approved' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  rejectJoinRequest: async (req, res) => {
    try {
      const group = await Group.findById(req.params.id);
      const userId = req.body.userId;

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.admin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      group.memberRequests = group.memberRequests.filter(id => id.toString() !== userId);
      await group.save();

      res.json({ message: 'Join request rejected' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getGroupPosts: async (req, res) => {
    try {
      const posts = await Post.find({ groupId: req.params.id })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMyGroups: async (req, res) => {
    try {
      const groups = await Group.find({ members: req.userId })
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('members', 'firstName lastName username profilePicture');

      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllGroups: async (req, res) => {
    try {
      const groups = await Group.find({ isPrivate: false })
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('members', 'firstName lastName username profilePicture')
        .limit(50);

      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = groupController;
