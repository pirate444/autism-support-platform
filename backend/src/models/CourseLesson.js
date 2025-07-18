const mongoose = require('mongoose');

const courseLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String }, // For article content
  lessonType: { 
    type: String, 
    enum: ['video', 'article', 'file', 'quiz', 'assignment'], 
    required: true 
  },
  order: { type: Number, required: true }, // For ordering lessons within section
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseSection', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Video content
  videoUrl: { type: String },
  videoDuration: { type: Number }, // in seconds
  thumbnailUrl: { type: String },
  
  // File attachments
  attachments: [{ 
    filename: String,
    originalName: String,
    url: String,
    fileType: String,
    fileSize: Number,
    description: String
  }],
  
  // Quiz content
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    timeLimit: Number, // in minutes
    passingScore: Number // percentage
  },
  
  // Assignment
  assignment: {
    instructions: String,
    dueDate: Date,
    maxPoints: Number,
    submissionType: { type: String, enum: ['file', 'text', 'both'] }
  },
  
  isPublished: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false }, // Free preview lesson
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseLesson', courseLessonSchema); 