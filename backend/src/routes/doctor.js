const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/authMiddleware');

// List/search doctors
router.get('/', auth, doctorController.listDoctors);

module.exports = router; 