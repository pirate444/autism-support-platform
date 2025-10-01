const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const authMiddleware = require('../middleware/authMiddleware');

// Get available languages (public endpoint)
router.get('/available', languageController.getAvailableLanguages);

// Get user's current language preference (requires authentication)
router.get('/user', authMiddleware, languageController.getUserLanguage);

// Update user language preference (requires authentication)
router.put('/user', authMiddleware, languageController.updateLanguage);


module.exports = router; 