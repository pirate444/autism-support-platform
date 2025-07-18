const CollaborationRequest = require('../models/CollaborationRequest');
const User = require('../models/User');
const Student = require('../models/Student');
const NotificationService = require('../services/notificationService');

// Create a collaboration request
exports.createRequest = async (req, res) => {
  try {
    const { studentId, requestType, reason } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ministry staff cannot request collaboration
    if (user.role === 'ministry_staff') {
      return res.status(403).json({ message: 'Ministry staff cannot submit collaboration requests.' });
    }
    
    // All other users can request collaboration
    // No other role restrictions - any authenticated user (except ministry staff) can submit a request
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if request already exists
    const existingRequest = await CollaborationRequest.findOne({
      requester: req.user.userId,
      student: studentId,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'A collaboration request already exists for this student' });
    }
    
    const request = new CollaborationRequest({
      requester: req.user.userId,
      student: studentId,
      requestType,
      reason
    });
    
    await request.save();
    
    // Send notification to admin about new request
    await NotificationService.notifyNewCollaborationRequest(request);
    
    const populatedRequest = await CollaborationRequest.findById(request._id)
      .populate('requester', 'name email role')
      .populate('student', 'name ministryCode');
    
    res.status(201).json(populatedRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all collaboration requests (admin only)
exports.getAllRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can view all requests' });
    }
    
    const requests = await CollaborationRequest.find()
      .populate('requester', 'name email role specialization')
      .populate('student', 'name ministryCode')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get requests by requester
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ requester: req.user.userId })
      .populate('student', 'name ministryCode')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve or reject a request (admin only)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can approve/reject requests' });
    }
    
    const request = await CollaborationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }
    
    const updateData = { status };
    if (status === 'approved') {
      updateData.approvedBy = req.user.userId;
      updateData.approvedAt = new Date();
      
      // When approving, add the requester to the student's assigned users
      const student = await Student.findById(request.student);
      if (student) {
        // Check if user is already assigned to avoid duplicates
        if (!student.assignedUsers || !student.assignedUsers.includes(request.requester)) {
          student.assignedUsers = student.assignedUsers || [];
          student.assignedUsers.push(request.requester);
          await student.save();
        }
      }
    }
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }
    
    const updatedRequest = await CollaborationRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('requester', 'name email role')
     .populate('student', 'name ministryCode')
     .populate('approvedBy', 'name');
    
    // Send notification to requester about approval/rejection
    if (status === 'approved') {
      await NotificationService.notifyCollaborationRequestApproved(updatedRequest, req.user.userId);
    } else if (status === 'rejected') {
      await NotificationService.notifyCollaborationRequestRejected(updatedRequest, req.user.userId, adminResponse);
    }
    
    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Check if user has collaboration access to a student
exports.checkCollaborationAccess = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Admin has access to all students
    if (user.isAdmin) {
      return res.json({ hasAccess: true, reason: 'admin' });
    }
    
    // Check if user is assigned to this student
    const student = await Student.findById(studentId);
    if (student && student.assignedUsers && student.assignedUsers.includes(req.user.userId)) {
      return res.json({ hasAccess: true, reason: 'assigned' });
    }
    
    // Check if user is the creator of this student
    if (student && student.createdBy && student.createdBy.toString() === req.user.userId) {
      return res.json({ hasAccess: true, reason: 'creator' });
    }
    
    // Check if there's an approved collaboration request
    const approvedRequest = await CollaborationRequest.findOne({
      requester: req.user.userId,
      student: studentId,
      status: 'approved'
    });
    
    if (approvedRequest) {
      return res.json({ hasAccess: true, reason: 'approved_request' });
    }
    
    // Check if there's a pending request
    const pendingRequest = await CollaborationRequest.findOne({
      requester: req.user.userId,
      student: studentId,
      status: 'pending'
    });
    
    if (pendingRequest) {
      return res.json({ hasAccess: false, reason: 'pending_request', requestId: pendingRequest._id });
    }
    
    // For ministry staff, show no_request but they cannot submit requests
    if (user.role === 'ministry_staff') {
      return res.json({ hasAccess: false, reason: 'ministry_staff_no_access' });
    }
    
    return res.json({ hasAccess: false, reason: 'no_request' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Debug endpoint to check all requests (temporary)
exports.debugAllRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find()
      .populate('requester', 'name email role specialization')
      .populate('student', 'name ministryCode')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      count: requests.length,
      requests: requests
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 