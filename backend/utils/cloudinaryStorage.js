const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png', 'mp4', 'pdf', 'docx', 'jpeg', 'gif'],
    resource_type: 'auto',
    access_mode: 'public',
    transformation: [{ quality: 'auto' }] // Optional: optimize files
  }
});

module.exports = storage;