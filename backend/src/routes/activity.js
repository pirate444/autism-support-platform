const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/authMiddleware');

// Create a new activity/game
router.post('/', auth, activityController.createActivity);

// List/browse activities/games
router.get('/', auth, activityController.listActivities);

module.exports = router; 