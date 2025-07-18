const Note = require('../models/Note');
const Appointment = require('../models/Appointment');
const ProgressReport = require('../models/ProgressReport');
const Student = require('../models/Student');
const User = require('../models/User');
const CollaborationRequest = require('../models/CollaborationRequest');
const NotificationService = require('../services/notificationService');

// Helper function to check collaboration permissions
const checkCollaborationPermission = async (userId, studentId) => {
  const user = await User.findById(userId);
  if (!user) return false;
  
  // Only admins have access to all students
  if (user.isAdmin) return true;

  // Check if user is assigned to this student
  const student = await Student.findById(studentId);
  if (student && student.assignedUsers && student.assignedUsers.includes(userId)) {
    return true;
  }
  
  // Check if user is the creator of this student
  if (student && student.createdBy && student.createdBy.toString() === userId) {
    return true;
  }
  
  // Check if there's an approved collaboration request
  const approvedRequest = await CollaborationRequest.findOne({
    requester: userId,
    student: studentId,
    status: 'approved'
  });
  
  return !!approvedRequest;
};

// ===== NOTES =====
exports.createNote = async (req, res) => {
  try {
    const { content, studentId } = req.body;
    if (!content || !studentId) {
      return res.status(400).json({ message: 'Content and student ID are required.' });
    }
    
    // Check collaboration permissions
    const hasPermission = await checkCollaborationPermission(req.user.userId, studentId);
    if (!hasPermission) {
      return res.status(403).json({ message: 'You need approval to collaborate with this student. Please submit a collaboration request.' });
    }
    
    const note = new Note({
      content,
      student: studentId,
      createdBy: req.user.userId
    });
    await note.save();
    
    // Send notification to other users assigned to this student
    await NotificationService.notifyNoteAdded(note, studentId, req.user.userId);
    
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getNotesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check collaboration permissions
    const hasPermission = await checkCollaborationPermission(req.user.userId, studentId);
    if (!hasPermission) {
      return res.status(403).json({ message: 'You need approval to view collaboration data for this student.' });
    }
    
    const notes = await Note.find({ student: studentId })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const note = await Note.findByIdAndUpdate(
      id,
      { content, updatedAt: Date.now() },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ===== APPOINTMENTS =====
exports.createAppointment = async (req, res) => {
  try {
    const { title, description, studentId, attendees, startTime, endTime } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, start time, and end time are required.' });
    }
    
    // Check collaboration permissions
    const hasPermission = await checkCollaborationPermission(req.user.userId, studentId);
    if (!hasPermission) {
      return res.status(403).json({ message: 'You need approval to collaborate with this student. Please submit a collaboration request.' });
    }
    
    const appointment = new Appointment({
      title,
      description,
      student: studentId,
      attendees,
      startTime,
      endTime,
      createdBy: req.user.userId
    });
    await appointment.save();
    
    // Send notification to other users assigned to this student
    await NotificationService.notifyAppointmentAdded(appointment, studentId, req.user.userId);
    
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};
    if (studentId) {
      // Check collaboration permissions if filtering by student
      const hasPermission = await checkCollaborationPermission(req.user.userId, studentId);
      if (!hasPermission) {
        return res.status(403).json({ message: 'You need approval to view collaboration data for this student.' });
      }
      filter.student = studentId;
    }
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('student', 'name ministryCode')
      .populate('attendees', 'name email role')
      .populate('createdBy', 'name role')
      .sort({ startTime: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.json({ message: 'Appointment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ===== PROGRESS REPORTS =====
exports.createProgressReport = async (req, res) => {
  try {
    const { studentId, reportDate, category, description, goals, achievements, nextSteps } = req.body;
    if (!studentId || !reportDate || !category || !description) {
      return res.status(400).json({ message: 'Student ID, report date, category, and description are required.' });
    }
    
    // Check collaboration permissions
    const hasPermission = await checkCollaborationPermission(req.user.userId, studentId);
    if (!hasPermission) {
      return res.status(403).json({ message: 'You need approval to collaborate with this student. Please submit a collaboration request.' });
    }
    
    const report = new ProgressReport({
      student: studentId,
      reportDate,
      category,
      description,
      goals,
      achievements,
      nextSteps,
      createdBy: req.user.userId
    });
    await report.save();
    
    // Send notification to other users assigned to this student
    await NotificationService.notifyProgressReportAdded(report, studentId, req.user.userId);
    
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getProgressReportsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { category } = req.query;
    
    // Check collaboration permissions
    const hasPermission = await checkCollaborationPermission(req.user.userId, studentId);
    if (!hasPermission) {
      return res.status(403).json({ message: 'You need approval to view collaboration data for this student.' });
    }
    
    const filter = { student: studentId };
    if (category) filter.category = category;
    
    const reports = await ProgressReport.find(filter)
      .populate('createdBy', 'name role')
      .sort({ reportDate: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateProgressReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const report = await ProgressReport.findByIdAndUpdate(id, updateData, { new: true });
    if (!report) {
      return res.status(404).json({ message: 'Progress report not found.' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteProgressReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await ProgressReport.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ message: 'Progress report not found.' });
    }
    res.json({ message: 'Progress report deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 