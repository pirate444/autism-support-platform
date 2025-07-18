const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { uploadAvatarMiddleware, uploadAvatar } = require('../controllers/userController');

// Get all users (admin only)
router.get('/', auth, userController.getAllUsers);

// Get users for chat (all authenticated users)
router.get('/chat/list', auth, userController.getUsersForChat);

// Get user profile
router.get('/:id', auth, userController.getUserProfile);

// Update user profile
router.put('/:id', auth, userController.updateUserProfile);

// Delete user (admin only)
router.delete('/:id', auth, userController.deleteUser);

// Upload avatar
router.post('/:id/avatar', auth, uploadAvatarMiddleware, uploadAvatar);

module.exports = router; 