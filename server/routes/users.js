const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/search', auth, userController.searchUsers);
router.get('/:id', auth, userController.getUser);
router.get('/username/:username', auth, userController.getUserByUsername);
router.put('/', auth, userController.updateUser);
router.post('/friend-request/:id', auth, userController.sendFriendRequest);
router.put('/accept-request/:id', auth, userController.acceptFriendRequest);
router.put('/reject-request/:id', auth, userController.rejectFriendRequest);
router.delete('/unfriend/:id', auth, userController.unfriend);
router.get('/friends/:id', auth, userController.getFriends);
router.get('/requests/list', auth, userController.getFriendRequests);
router.post('/follow/:id', auth, userController.followUser);
router.post('/unfollow/:id', auth, userController.unfollowUser);

module.exports = router;
