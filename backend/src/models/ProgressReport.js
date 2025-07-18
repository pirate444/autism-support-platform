const mongoose = require('mongoose');

const progressReportSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportDate: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ['academic', 'social', 'behavioral', 'communication'], 
    required: true 
  },
  description: { type: String, required: true },
  goals: [{ type: String }],
  achievements: [{ type: String }],
  nextSteps: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProgressReport', progressReportSchema); 