const Student = require('../models/Student');
const User = require('../models/User');
const Joi = require('joi');
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/actions.log' })
  ]
});

// Create a new student
exports.createStudent = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    dateOfBirth: Joi.date().iso().required(),
    ministryCode: Joi.string().max(50).allow('', null),
    assignedUsers: Joi.array().items(Joi.string().hex().length(24)).optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation failed', errors: error.details });
  }
  try {
    const { name, dateOfBirth, assignedUsers, ministryCode } = req.body;
    if (!name || !dateOfBirth) {
      return res.status(400).json({ message: 'Name and date of birth are required.' });
    }

    // Only allow teachers (school support assistants), parents, and trainers (specialist educators) to create students
    const allowedRoles = ['school_support_assistant', 'parent', 'specialist_educator'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only teachers, parents, and trainers can add new students.' });
    }

    const student = new Student({ name, dateOfBirth, assignedUsers, ministryCode, createdBy: req.user.userId });
    // Automatically assign the creator to the student for all allowed roles
    student.assignedUsers = student.assignedUsers || [];
    if (!student.assignedUsers.map(id => id.toString()).includes(req.user.userId)) {
      student.assignedUsers.push(req.user.userId);
    }
    await student.save();
    
    // Return student without ministry code, but include createdBy
    const studentResponse = await Student.findById(student._id)
      .select('-ministryCode')
      .populate('assignedUsers', 'name email role')
      .populate('createdBy', 'name email');
    
    res.status(201).json(studentResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get a student by ministry code
exports.getStudentByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const student = await Student.findOne({ ministryCode: code }).populate('assignedUsers', 'name email role');
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Assign users to a student
exports.assignUsers = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { userIds } = req.body; // array of user IDs
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { assignedUsers: { $each: userIds } } },
      { new: true }
    ).select('-ministryCode').populate('assignedUsers', 'name email role');
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get all students (with optional filtering)
exports.getAllStudents = async (req, res) => {
  try {
    const { name } = req.query;
    const filter = {};
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    const students = await Student.find(filter)
      .populate('assignedUsers', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get students assigned to the current user (for doctors and other professionals)
exports.getMyAssignedStudents = async (req, res) => {
  try {
    const { name } = req.query;
    const filter = { assignedUsers: req.user.userId };
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    const students = await Student.find(filter)
      .populate('assignedUsers', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get unassigned students for parents to claim
exports.getUnassignedStudents = async (req, res) => {
  try {
    // Only parents can access this endpoint
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can access unassigned students.' });
    }

    const { name } = req.query;
    const filter = { 
      assignedUsers: { $exists: true, $size: 0 } // Students with no assigned users
    };
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    const students = await Student.find(filter)
      .select('-ministryCode') // Exclude ministry code
      .populate('assignedUsers', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Allow parents to assign themselves to a student
exports.assignSelfToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Only parents can assign themselves
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can assign themselves to students.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Check if parent is already assigned
    if (student.assignedUsers && student.assignedUsers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You are already assigned to this student.' });
    }

    // Add parent to assigned users
    student.assignedUsers = student.assignedUsers || [];
    student.assignedUsers.push(req.user.userId);
    await student.save();

    const populatedStudent = await Student.findById(studentId)
      .select('-ministryCode')
      .populate('assignedUsers', 'name email role');

    res.json(populatedStudent);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 

// Search student by ministry code for collaboration requests
exports.searchStudentForCollaboration = async (req, res) => {
  try {
    const { ministryCode } = req.query;
    
    if (!ministryCode) {
      return res.status(400).json({ message: 'Ministry code is required for search.' });
    }

    const student = await Student.findOne({ ministryCode })
      .select('_id name dateOfBirth') // Only return basic info needed for collaboration
      .populate('assignedUsers', 'name email role');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found with this ministry code.' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 

// Delete a student (only creator or admin)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    // Only creator or admin can delete
    if (
      (!req.user.isAdmin) &&
      (!student.createdBy || student.createdBy.toString() !== req.user.userId)
    ) {
      return res.status(403).json({ message: 'You are not authorized to delete this student.' });
    }
    await student.deleteOne();
    logger.info(`User ${req.user.userId} deleted student ${id} at ${new Date().toISOString()}`);
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 