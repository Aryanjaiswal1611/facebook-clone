const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

const postController = {
  createPost: async (req, res) => {
    try {
      const { description, image, video, groupId, pageId } = req.body;

      const post = new Post({
        userId: req.userId,
        description,
        image,
        video,
        groupId,
        pageId
      });

      await post.save();
      const populatedPost = await Post.findById(post._id)
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      res.status(201).json(populatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { description, image } = req.body;
      post.description = description || post.description;
      post.image = image || post.image;

      await post.save();
      const updatedPost = await Post.findById(post._id)
        .populate('userId', 'firstName lastName username profilePicture');

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Post.findByIdAndDelete(req.params.id);
      res.json({ message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getTimeline: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      const friends = user.friends;

      const posts = await Post.find({
        $or: [
          { userId: { $in: [...friends, req.userId] } },
          { userId: req.userId }
        ]
      })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserPosts: async (req, res) => {
    try {
      const posts = await Post.find({ userId: req.params.id })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  likePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.likes.includes(req.userId)) {
        return res.status(400).json({ message: 'Already liked' });
      }

      post.likes.push(req.userId);
      await post.save();

      if (post.userId.toString() !== req.userId) {
        const notification = new Notification({
          recipient: post.userId,
          sender: req.userId,
          type: 'like',
          postId: post._id
        });
        await notification.save();
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  unlikePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.likes = post.likes.filter(id => id.toString() !== req.userId);
      await post.save();

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  commentPost: async (req, res) => {
    try {
      const { text } = req.body;
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comment = {
        userId: req.userId,
        text,
        createdAt: new Date()
      };

      post.comments.push(comment);
      await post.save();

      if (post.userId.toString() !== req.userId) {
        const notification = new Notification({
          recipient: post.userId,
          sender: req.userId,
          type: 'comment',
          postId: post._id,
          text
        });
        await notification.save();
      }

      const updatedPost = await Post.findById(post._id)
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.userId.toString() !== req.userId && post.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      comment.deleteOne();
      await post.save();

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  sharePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.shares.push(req.userId);
      await post.save();

      const newPost = new Post({
        userId: req.userId,
        description: req.body.description || '',
        groupId: req.body.groupId,
        pageId: req.body.pageId
      });
      await newPost.save();

      res.json(newPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  savePost: async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (user.savedPosts.includes(req.params.id)) {
        return res.status(400).json({ message: 'Post already saved' });
      }

      user.savedPosts.push(req.params.id);
      await user.save();

      res.json({ message: 'Post saved' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  unsavePost: async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.id);
      await user.save();

      res.json({ message: 'Post unsaved' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getSavedPosts: async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate({
        path: 'savedPosts',
        populate: [
          { path: 'userId', select: 'firstName lastName username profilePicture' },
          { path: 'comments.userId', select: 'firstName lastName username profilePicture' }
        ]
      });

      res.json(user.savedPosts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = postController;
