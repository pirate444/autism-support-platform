const mongoose = require('mongoose');

const courseAccessRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestReason: {
    type: String,
    required: true
  },
  adminResponse: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Ensure one request per user per course
courseAccessRequestSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseAccessRequest', courseAccessRequestSchema); 