const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const CourseLesson = require('../models/CourseLesson');
const NotificationService = require('../services/notificationService');

// ===== COURSE MANAGEMENT =====
exports.createCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      content, 
      category, 
      level,
      language,
      thumbnailUrl,
      previewVideoUrl,
      isFree,
      price,
      currency,
      requirements,
      outcomes,
      tags
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }
    
    // Only allow specialist_educator (trainers) to create courses
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can create courses.' });
    }
    
    const course = new Course({
      title,
      description,
      content,
      category,
      level: level || 'beginner',
      language: language || 'English',
      thumbnailUrl,
      previewVideoUrl,
      isFree: isFree || false,
      price: price ? parseFloat(price) : 0,
      currency: currency || 'USD',
      requirements: requirements || [],
      outcomes: outcomes || [],
      tags: tags || [],
      createdBy: req.user.userId
    });
    await course.save();
    
    // Send notification to all users about new course
    await NotificationService.notifyCourseCreated(course, req.user.userId);
    
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const { title, category, isPublished } = req.query;
    const filter = {};
    
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    
    const courses = await Course.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('createdBy', 'name role');
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Only allow specialist_educator (trainers) to update courses
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can update courses.' });
    }
    
    const course = await Course.findByIdAndUpdate(id, updateData, { new: true });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow specialist_educator (trainers) to delete courses
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can delete courses.' });
    }
    
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    // Also delete related progress records
    await CourseProgress.deleteMany({ course: id });
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow specialist_educator (trainers) to toggle publish status
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can publish/unpublish courses.' });
    }
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    const wasPublished = course.isPublished;
    course.isPublished = !course.isPublished;
    await course.save();
    
    // Send notification when course is published (not when unpublished)
    if (course.isPublished && !wasPublished) {
      await NotificationService.notifyCoursePublished(course, req.user.userId);
    }
    
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ===== COURSE PROGRESS =====
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    if (!course.isPublished) {
      return res.status(400).json({ message: 'Course is not published.' });
    }
    
    const progress = new CourseProgress({
      user: req.user.userId,
      course: courseId
    });
    await progress.save();
    res.status(201).json(progress);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Already enrolled in this course.' });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, isCompleted } = req.body;
    // Find or create progress record
    let progressRecord = await CourseProgress.findOne({ user: req.user.userId, course: courseId });
    if (!progressRecord) {
      progressRecord = new CourseProgress({ user: req.user.userId, course: courseId, completedLessons: [] });
    }
    // Add lessonId to completedLessons if not already present
    if (lessonId && isCompleted) {
      if (!progressRecord.completedLessons) progressRecord.completedLessons = [];
      if (!progressRecord.completedLessons.map(id => id.toString()).includes(lessonId)) {
        progressRecord.completedLessons.push(lessonId);
      }
    }
    // Get total lessons in the course
    const totalLessons = await CourseLesson.countDocuments({ course: courseId });
    // Calculate progress percentage
    const completedCount = progressRecord.completedLessons ? progressRecord.completedLessons.length : 0;
    progressRecord.progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    progressRecord.isCompleted = progressRecord.progress === 100;
    progressRecord.completedAt = progressRecord.isCompleted ? new Date() : null;
    await progressRecord.save();
    res.json({
      progress: progressRecord.progress,
      completedLessons: progressRecord.completedLessons.map(id => id.toString())
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await CourseProgress.find({ user: req.user.userId })
      .populate('course', 'title description category duration')
      .sort({ createdAt: -1 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await CourseProgress.findOne({ user: req.user.userId, course: courseId });
    if (!progress) {
      return res.json({ progress: 0, completedLessons: [] });
    }
    res.json({
      progress: progress.progress || 0,
      completedLessons: progress.completedLessons ? progress.completedLessons.map(id => id.toString()) : []
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ===== VIDEO UPLOAD FOR COURSES =====
exports.uploadCourseVideo = async (req, res) => {
  try {
    // Only allow specialist_educator (trainers) to upload course videos
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can upload course videos.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded.' });
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: 'Invalid video file type. Allowed: MP4, WebM, OGG, AVI, MOV',
        receivedType: req.file.mimetype,
        allowedTypes
      });
    }

    // Check file size (max 200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: 'Video file too large. Maximum size: 200MB',
        receivedSize: req.file.size,
        maxSize
      });
    }

    // Ensure uploads directory exists
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Verify file was actually saved
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({ 
        message: 'Failed to save video file. Please try again.',
        filePath: req.file.path
      });
    }

    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Video uploaded successfully',
      videoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      filePath: req.file.path
    });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ 
      message: 'Server error during video upload.', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.uploadCourseThumbnail = async (req, res) => {
  try {
    // Only allow specialist_educator (trainers) to upload course thumbnails
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can upload course thumbnails.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No thumbnail image uploaded.' });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid image file type. Allowed: JPEG, PNG, GIF, WebP' });
    }

    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 