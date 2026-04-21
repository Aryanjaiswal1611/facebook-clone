const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.post('/', auth, messageController.sendMessage);
router.get('/conversations', auth, messageController.getConversations);
router.get('/:otherUserId', auth, messageController.getMessages);
router.put('/seen/:messageId', auth, messageController.markAsSeen);
router.delete('/:messageId', auth, messageController.deleteMessage);

module.exports = router;
