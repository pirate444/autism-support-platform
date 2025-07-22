const path = require('path');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Cloudinary URL is in req.file.path
    res.json({
      message: 'File uploaded successfully.',
      fileUrl: req.file.path, // Cloudinary URL
      public_id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed.', error: err.message });
  }
};


