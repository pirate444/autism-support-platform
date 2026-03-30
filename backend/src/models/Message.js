const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // optional, for context
});

// Indexes for efficient queries
messageSchema.index({ sender: 1, recipient: 1, timestamp: -1 });
messageSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema); 