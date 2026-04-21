const Page = require('../models/Page');
const Post = require('../models/Post');
const User = require('../models/User');

const pageController = {
  createPage: async (req, res) => {
    try {
      const { name, description, category } = req.body;

      const page = new Page({
        name,
        description,
        category,
        admin: req.userId,
        followers: [req.userId],
        likes: [req.userId]
      });

      await page.save();

      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { pages: page._id }
      });

      const populatedPage = await Page.findById(page._id)
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('followers', 'firstName lastName username profilePicture');

      res.status(201).json(populatedPage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id)
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('followers', 'firstName lastName username profilePicture')
        .populate('likes', 'firstName lastName username profilePicture');

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      res.json(page);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updatePage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      if (page.admin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { name, description, coverPicture, profilePicture, category } = req.body;

      page.name = name || page.name;
      page.description = description || page.description;
      page.coverPicture = coverPicture || page.coverPicture;
      page.profilePicture = profilePicture || page.profilePicture;
      page.category = category || page.category;

      await page.save();

      const updatedPage = await Page.findById(page._id)
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('followers', 'firstName lastName username profilePicture');

      res.json(updatedPage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deletePage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      if (page.admin.toString() !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Post.deleteMany({ pageId: page._id });
      await Page.findByIdAndDelete(page._id);

      res.json({ message: 'Page deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  likePage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      if (page.likes.includes(req.userId)) {
        return res.status(400).json({ message: 'Already liked' });
      }

      page.likes.push(req.userId);
      page.followers.push(req.userId);
      await page.save();

      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { pages: page._id }
      });

      res.json({ message: 'Page liked' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  unlikePage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      page.likes = page.likes.filter(id => id.toString() !== req.userId);
      page.followers = page.followers.filter(id => id.toString() !== req.userId);
      await page.save();

      await User.findByIdAndUpdate(req.userId, {
        $pull: { pages: page._id }
      });

      res.json({ message: 'Page unliked' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  followPage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      if (page.followers.includes(req.userId)) {
        return res.status(400).json({ message: 'Already following' });
      }

      page.followers.push(req.userId);
      await page.save();

      res.json({ message: 'Now following page' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  unfollowPage: async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);

      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }

      page.followers = page.followers.filter(id => id.toString() !== req.userId);
      await page.save();

      res.json({ message: 'Unfollowed page' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPagePosts: async (req, res) => {
    try {
      const posts = await Post.find({ pageId: req.params.id })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName username profilePicture')
        .populate('comments.userId', 'firstName lastName username profilePicture');

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMyPages: async (req, res) => {
    try {
      const pages = await Page.find({ admin: req.userId })
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('followers', 'firstName lastName username profilePicture');

      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getLikedPages: async (req, res) => {
    try {
      const pages = await Page.find({ likes: req.userId })
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('followers', 'firstName lastName username profilePicture');

      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllPages: async (req, res) => {
    try {
      const pages = await Page.find()
        .populate('admin', 'firstName lastName username profilePicture')
        .populate('followers', 'firstName lastName username profilePicture')
        .limit(50);

      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = pageController;
