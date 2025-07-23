const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/authMiddleware');
const storage = require('../../utils/cloudinaryStorage');

const upload = multer({ storage: storage });

// Upload a single file (with authentication)
router.post('/', auth, upload.single('file'), uploadController.uploadFile);

// (Optional) Direct upload route for testing
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    url: req.file.path, // Cloudinary URL
    public_id: req.file.filename,
    originalname: req.file.originalname,
  });
});

// (Optional) Remove this if not needed anymore
// router.get('/:filename', auth, uploadController.getFile);

module.exports = router;