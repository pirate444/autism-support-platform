const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');

// Upload a single file
router.post('/', auth, upload.single('file'), uploadController.uploadFile);

// Get a file by filename
router.get('/:filename', auth, uploadController.getFile);

module.exports = router; 