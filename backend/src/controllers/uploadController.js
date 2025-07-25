const cloudinary = require('cloudinary').v2; // Make sure to require cloudinary

exports.uploadFile = async (req, res) => {
  console.log('uploadFile called');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    res.json({
      message: 'File uploaded successfully.',
      fileUrl: req.file.path,
      public_id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
    
  } catch (err) {
    console.log('UPLOAD ERROR:', err);
    res.status(500).json({
      message: 'Upload failed.',
      error: "File processing error" // Generic error
    });
  }
};