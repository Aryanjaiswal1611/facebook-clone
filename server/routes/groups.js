const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

router.post('/', auth, groupController.createGroup);
router.get('/my', auth, groupController.getMyGroups);
router.get('/all', auth, groupController.getAllGroups);
router.get('/:id', auth, groupController.getGroup);
router.put('/:id', auth, groupController.updateGroup);
router.delete('/:id', auth, groupController.deleteGroup);
router.post('/join/:id', auth, groupController.joinGroup);
router.post('/leave/:id', auth, groupController.leaveGroup);
router.post('/approve/:id', auth, groupController.approveJoinRequest);
router.post('/reject/:id', auth, groupController.rejectJoinRequest);
router.get('/:id/posts', auth, groupController.getGroupPosts);

module.exports = router;
