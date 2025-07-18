const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// Send a message
router.post('/', auth, messageController.sendMessage);

// Get messages between users
router.get('/', auth, messageController.getMessages);

// Get all conversations for the logged-in user
router.get('/conversations', auth, messageController.getConversations);

// Get total unread message count
router.get('/unread/count', auth, messageController.getUnreadCount);

// Get unread message count for a specific user
router.get('/unread/count/:userId', auth, messageController.getUnreadCountForUser);

// Get messages with a specific user (by recipient ID)
router.get('/:recipientId', auth, messageController.getMessagesWithUser);

// Mark messages as read
router.put('/:recipientId/read', auth, messageController.markMessagesAsRead);

module.exports = router; 