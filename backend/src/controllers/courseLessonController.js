const CourseLesson = require('../models/CourseLesson');
const CourseSection = require('../models/CourseSection');
const Course = require('../models/Course');

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      content, 
      lessonType, 
      sectionId, 
      order,
      videoUrl,
      videoDuration,
      thumbnailUrl,
      attachments,
      quiz,
      assignment,
      isFree
    } = req.body;
    
    if (!title || !lessonType || !sectionId) {
      return res.status(400).json({ message: 'Title, lesson type, and section ID are required.' });
    }
    
    // Check if user can edit this section
    const section = await CourseSection.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found.' });
    }
    
    if (section.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    
    const lessonData = {
      title,
      description,
      content,
      lessonType,
      order: order || 0,
      section: sectionId,
      course: section.course,
      videoUrl: videoUrl || undefined,
      videoDuration,
      thumbnailUrl,
      attachments: attachments || [],
      quiz: quiz || null,
      assignment: assignment || null,
      isFree: isFree || false,
      createdBy: req.user.userId
    };

    // If this is a video lesson and a file was uploaded, override videoUrl
    if (lessonType === 'video' && req.file) {
      lessonData.videoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const lesson = new CourseLesson(lessonData);
    await lesson.save();
    // Fetch the saved lesson to ensure all fields (including videoUrl) are present
    const savedLesson = await CourseLesson.findById(lesson._id);
    
    // Update course lesson count and duration
    const course = await Course.findById(section.course);
    if (course) {
      const updateData = {
        $inc: { totalLessons: 1 },
        updatedAt: Date.now()
      };
      
      if (videoDuration) {
        updateData.$inc.totalDuration = Math.ceil(videoDuration / 60); // Convert to minutes
      }
      
      await Course.findByIdAndUpdate(section.course, updateData);
    }
    
    res.status(201).json(savedLesson);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get lessons for a section
exports.getSectionLessons = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const lessons = await CourseLesson.find({ section: sectionId })
      .populate('createdBy', 'name')
      .sort({ order: 1 });
    
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get a single lesson
exports.getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await CourseLesson.findById(id)
      .populate('createdBy', 'name')
      .populate('section', 'title')
      .populate('course', 'title');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }
    
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await CourseLesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }
    
    // Check permissions
    if (lesson.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }

    // Whitelist allowed update fields
    const allowedFields = [
      'title', 'description', 'content', 'lessonType', 'order',
      'videoUrl', 'videoDuration', 'thumbnailUrl', 'attachments',
      'quiz', 'assignment', 'isPublished', 'isFree'
    ];
    const updateData = { updatedAt: Date.now() };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    const updatedLesson = await CourseLesson.findByIdAndUpdate(
      id, updateData, { new: true }
    );
    
    res.json(updatedLesson);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a lesson
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await CourseLesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }
    
    // Check permissions
    if (lesson.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    
    await CourseLesson.findByIdAndDelete(id);
    
    // Update course lesson count and duration
    const course = await Course.findById(lesson.course);
    if (course) {
      const updateData = {
        $inc: { totalLessons: -1 },
        updatedAt: Date.now()
      };
      
      if (lesson.videoDuration) {
        updateData.$inc.totalDuration = -Math.ceil(lesson.videoDuration / 60);
      }
      
      await Course.findByIdAndUpdate(lesson.course, updateData);
    }
    
    res.json({ message: 'Lesson deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Upload lesson file
exports.uploadLessonFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Reorder lessons
exports.reorderLessons = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { lessonOrders } = req.body; // Array of { lessonId, order }
    
    // Check if user can edit this section
    const section = await CourseSection.findById(sectionId);
    if (!section || (section.createdBy.toString() !== req.user.userId && !req.user.isAdmin)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    
    // Update all lessons with new orders using bulkWrite
    const bulkOps = lessonOrders.map(item => ({
      updateOne: {
        filter: { _id: item.lessonId },
        update: { order: item.order }
      }
    }));
    await CourseLesson.bulkWrite(bulkOps);
    
    res.json({ message: 'Lessons reordered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};