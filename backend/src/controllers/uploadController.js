const path = require('path');

exports.uploadFile = async (req, res) => {
  console.log('uploadFile called');
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
    console.log('UPLOAD ERROR:', err);
    res.status(500).json({
      message: 'Upload failed.',
      error: err.message,
      stack: err.stack, // This gives you the full stack trace
      fullError: err    // This will show the entire error object (optional, for even more detail)
    });
  }
};


