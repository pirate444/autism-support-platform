const CourseSection = require('../models/CourseSection');
const CourseLesson = require('../models/CourseLesson');
const Course = require('../models/Course');

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const { title, description, courseId, order } = req.body;
    
    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and course ID are required.' });
    }
    
    // Check if user can edit this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    
    if (course.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    
    const section = new CourseSection({
      title,
      description,
      order: order || 0,
      course: courseId,
      createdBy: req.user.userId
    });
    
    await section.save();
    
    // Update course section count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalSections: 1 },
      updatedAt: Date.now()
    });
    
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get sections for a course
exports.getCourseSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const sections = await CourseSection.find({ course: courseId })
      .populate('createdBy', 'name')
      .sort({ order: 1 });
    
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order, isPublished } = req.body;
    
    const section = await CourseSection.findById(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found.' });
    }
    
    // Check permissions
    if (section.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }

    // Only update allowed fields
    const updateData = { updatedAt: Date.now() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    const updatedSection = await CourseSection.findByIdAndUpdate(
      id, updateData, { new: true }
    );
    
    res.json(updatedSection);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a section and its lessons
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await CourseSection.findById(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found.' });
    }
    
    // Check permissions
    if (section.createdBy.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }

    // Count lessons being deleted to update course totals
    const lessonCount = await CourseLesson.countDocuments({ section: id });

    // Cascade delete all lessons in this section
    await CourseLesson.deleteMany({ section: id });
    
    await CourseSection.findByIdAndDelete(id);
    
    // Update course section and lesson counts
    await Course.findByIdAndUpdate(section.course, {
      $inc: { totalSections: -1, totalLessons: -lessonCount },
      updatedAt: Date.now()
    });
    
    res.json({ message: 'Section and its lessons deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Reorder sections
exports.reorderSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionOrders } = req.body; // Array of { sectionId, order }
    
    // Check if user can edit this course
    const course = await Course.findById(courseId);
    if (!course || (course.createdBy.toString() !== req.user.userId && !req.user.isAdmin)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    
    // Update all sections with new orders
    const bulkOps = sectionOrders.map(item => ({
      updateOne: {
        filter: { _id: item.sectionId },
        update: { order: item.order }
      }
    }));
    await CourseSection.bulkWrite(bulkOps);
    
    res.json({ message: 'Sections reordered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};