const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const auth = require('../middleware/auth');

router.post('/', auth, pageController.createPage);
router.get('/my', auth, pageController.getMyPages);
router.get('/liked', auth, pageController.getLikedPages);
router.get('/all', auth, pageController.getAllPages);
router.get('/:id', auth, pageController.getPage);
router.put('/:id', auth, pageController.updatePage);
router.delete('/:id', auth, pageController.deletePage);
router.post('/like/:id', auth, pageController.likePage);
router.post('/unlike/:id', auth, pageController.unlikePage);
router.post('/follow/:id', auth, pageController.followPage);
router.post('/unfollow/:id', auth, pageController.unfollowPage);
router.get('/:id/posts', auth, pageController.getPagePosts);

module.exports = router;
