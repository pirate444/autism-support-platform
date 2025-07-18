const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'collaboration_request_approved',
      'collaboration_request_rejected', 
      'collaboration_request_received',
      'note_added',
      'appointment_added',
      'progress_report_added',
      'student_assigned',
      'student_unassigned',
      'new_team_member',
      'course_created',
      'course_published',
      'course_access_request',
      'course_access_approved',
      'course_access_rejected',
      'message_received',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedCollaborationRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborationRequest'
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 