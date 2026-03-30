const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for video uploads with file filter
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'course-video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video file type. Allowed: MP4, WebM, OGG, AVI, MOV'), false);
  }
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

// Configure multer for thumbnail uploads with file filter
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'course-thumbnail-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const thumbnailFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Allowed: JPEG, PNG, GIF, WebP'), false);
  }
};

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter: thumbnailFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ===== COURSE MANAGEMENT ROUTES =====
router.post('/', auth, courseController.createCourse);
router.get('/', auth, courseController.listCourses);
router.get('/:id', auth, courseController.getCourseById);
router.put('/:id', auth, courseController.updateCourse);
router.delete('/:id', auth, courseController.deleteCourse);
router.put('/:id/publish', auth, courseController.togglePublishStatus);

// ===== COURSE PROGRESS ROUTES =====
router.post('/:courseId/enroll', auth, courseController.enrollInCourse);
router.put('/:courseId/progress', auth, courseController.updateProgress);
router.get('/progress/user', auth, courseController.getUserProgress);
router.get('/:courseId/progress', auth, courseController.getCourseProgress);

// ===== VIDEO UPLOAD ROUTES =====
router.post('/upload/video', auth, videoUpload.single('video'), courseController.uploadCourseVideo);
router.post('/upload/thumbnail', auth, thumbnailUpload.single('thumbnail'), courseController.uploadCourseThumbnail);

module.exports = router;