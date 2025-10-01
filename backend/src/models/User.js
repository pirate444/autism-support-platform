const mongoose = require('mongoose');

const roles = [
  'child_psychiatrist',
  'specialist_educator',
  'occupational_therapist',
  'psychologist',
  'school_support_assistant',
  'speech_therapist',
  'parent',
  'ministry_staff'
];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: roles, required: true },
  isAdmin: { type: Boolean, default: false }, // Single admin flag
  language: { type: String, default: 'en', enum: ['en', 'ar', 'fr', 'es'] }, // Language preference
  specialization: { type: String }, // Required for doctor roles
  avatar: { type: String }, // URL to avatar image
  phone: { type: String },
  bio: { type: String },
  location: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  // Professional fields
  qualifications: { type: String }, // For professionals
  yearsOfExperience: { type: Number }, // For professionals
  workplace: { type: String }, // For professionals
  // Parent fields
  childName: { type: String }, // For parents
  childAge: { type: Number }, // For parents
  childDiagnosis: { type: String }, // For parents
  // Student fields
  school: { type: String }, // For students
  grade: { type: String }, // For students
  supportNeeds: { type: String }, // For students
  // Add more fields as needed
}, { timestamps: true });

// Remove the problematic unique index - admin uniqueness will be handled in application logic

module.exports = mongoose.model('User', userSchema); 