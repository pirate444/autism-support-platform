const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ministryCode: { type: String, unique: true, sparse: true }, // Made optional, sparse index for unique constraint
  dateOfBirth: { type: Date, required: true },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema); 