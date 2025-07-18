const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseLesson' }],
  createdAt: { type: Date, default: Date.now }
});

// Ensure one progress record per user per course
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema); 