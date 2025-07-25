const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Optional: change folder name as needed
    allowed_formats: ['jpg', 'png', 'mp4', 'pdf', 'docx', 'jpeg', 'gif'], // Add formats you need
    resource_type: 'auto',
    // 👈 This makes sure all uploaded files are private
    access_mode: 'authenticated'
  },
});

module.exports = storage;