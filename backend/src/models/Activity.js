const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'game', 'activity', 'pdf'
  category: { type: String }, // e.g., 'social skills', 'educational puzzle'
  fileUrl: { type: String }, // For PDF or downloadable content
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  // Add more fields as needed
});

module.exports = mongoose.model('Activity', activitySchema); 