const express = require('express');
const router = express.Router();
const courseLessonController = require('../controllers/courseLessonController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for lesson file uploads
const lessonFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lesson-file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const lessonFileUpload = multer({
  storage: lessonFileStorage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  }
});

// Lesson routes
router.post('/', auth, lessonFileUpload.single('file'), courseLessonController.createLesson);
router.get('/section/:sectionId', auth, courseLessonController.getSectionLessons);
router.get('/:id', auth, courseLessonController.getLesson);
router.put('/:id', auth, courseLessonController.updateLesson);
router.delete('/:id', auth, courseLessonController.deleteLesson);
router.put('/section/:sectionId/reorder', auth, courseLessonController.reorderLessons);

// File upload routes
router.post('/upload/file', auth, lessonFileUpload.single('file'), courseLessonController.uploadLessonFile);

module.exports = router; 