const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Optional: change folder name as needed
    allowed_formats: ['jpg', 'png', 'mp4', 'pdf', 'docx', 'jpeg', 'gif'], // Add formats you need
  },
});

module.exports = storage;