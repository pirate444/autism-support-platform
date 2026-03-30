const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const CourseLesson = require('../models/CourseLesson');
const CourseSection = require('../models/CourseSection');
const CourseAccessRequest = require('../models/CourseAccessRequest');
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
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const { title, category, isPublished, page = 1, limit = 20 } = req.query;
    const filter = {};
    const skip = (page - 1) * limit;
    
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    
    const courses = await Course.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);
    res.json({
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
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
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow specialist_educator (trainers) to update courses
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can update courses.' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Only the creator or admin can update
    if (course.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only update your own courses.' });
    }

    // Whitelist allowed update fields to prevent mass assignment
    const allowedFields = [
      'title', 'description', 'content', 'category', 'level', 'language',
      'thumbnailUrl', 'previewVideoUrl', 'isFree', 'price', 'currency',
      'requirements', 'outcomes', 'tags', 'totalLessons', 'totalDuration', 'totalSections'
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    updateData.updatedAt = Date.now();
    
    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow specialist_educator (trainers) to delete courses
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can delete courses.' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Only the creator or admin can delete
    if (course.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own courses.' });
    }

    // Cascade delete all related records
    await CourseLesson.deleteMany({ course: id });
    await CourseSection.deleteMany({ course: id });
    await CourseProgress.deleteMany({ course: id });
    await CourseAccessRequest.deleteMany({ course: id });
    await course.deleteOne();

    res.json({ message: 'Course and all related data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
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

    // Only the creator or admin can publish/unpublish
    if (course.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only publish/unpublish your own courses.' });
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
    res.status(500).json({ message: 'Server error.' });
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
    res.status(500).json({ message: 'Server error.' });
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
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await CourseProgress.find({ user: req.user.userId })
      .populate('course', 'title description category duration')
      .sort({ createdAt: -1 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
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
    res.status(500).json({ message: 'Server error.' });
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

    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Video uploaded successfully',
      videoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during video upload.' });
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

    const thumbnailUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};