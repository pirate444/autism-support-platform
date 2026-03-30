const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String }, // Course overview/introduction
  category: { type: String }, // e.g., 'autism awareness', 'teaching strategies'
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  },
  language: { type: String, default: 'English' },
  
  // Course media
  thumbnailUrl: { type: String }, // Course thumbnail
  previewVideoUrl: { type: String }, // Course preview video
  
  // Course structure
  totalLessons: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in minutes
  totalSections: { type: Number, default: 0 },
  
  // Pricing and access
  isFree: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  
  // Course requirements and outcomes
  requirements: [String], // What students need to know
  outcomes: [String], // What students will learn
  
  // Course status - consolidated to single isPublished field
  isPublished: { type: Boolean, default: false },
  
  // Metadata
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for better query performance
courseSchema.index({ createdBy: 1, createdAt: -1 });
courseSchema.index({ isPublished: 1, createdAt: -1 });
courseSchema.index({ category: 1 });

module.exports = mongoose.model('Course', courseSchema);