const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

router.post('/', auth, postController.createPost);
router.get('/timeline', auth, postController.getTimeline);
router.get('/user/:id', auth, postController.getUserPosts);
router.get('/saved', auth, postController.getSavedPosts);
router.get('/:id', auth, postController.getPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.post('/like/:id', auth, postController.likePost);
router.post('/unlike/:id', auth, postController.unlikePost);
router.post('/comment/:id', auth, postController.commentPost);
router.delete('/:postId/comment/:commentId', auth, postController.deleteComment);
router.post('/share/:id', auth, postController.sharePost);
router.post('/save/:id', auth, postController.savePost);
router.post('/unsave/:id', auth, postController.unsavePost);

module.exports = router;
