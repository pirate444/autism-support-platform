const cloudinary = require('cloudinary').v2; // Make sure to require cloudinary

exports.uploadFile = async (req, res) => {
  console.log('uploadFile called');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // 1. Upload to Cloudinary with explicit settings
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw', // Critical for PDFs
      public_id: `uploads/${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
      access_mode: 'public',
      overwrite: false
    });

    // 2. Return the PROPER Cloudinary URL
    res.json({
      message: 'File uploaded successfully.',
      fileUrl: result.secure_url, // Always use secure_url
      public_id: result.public_id,
      originalName: req.file.originalname,
      size: result.bytes // More accurate than req.file.size
    });

  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({
      message: 'Upload failed.',
      error: err.message.replace(/cloudinary.*$/i, '[REDACTED]'), // Hide API keys
      errorType: err.name
    });
  }
};