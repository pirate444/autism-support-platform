const CourseAccessRequest = require('../models/CourseAccessRequest');
const Course = require('../models/Course');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

// Request access to a paid course
exports.requestAccess = async (req, res) => {
  try {
    const { courseId, requestReason } = req.body;
    
    if (!courseId || !requestReason) {
      return res.status(400).json({ message: 'Course ID and request reason are required.' });
    }
    
    // Check if course exists and is paid
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    
    if (course.isFree) {
      return res.status(400).json({ message: 'Access requests are only for paid courses.' });
    }
    
    // Check if request already exists
    const existingRequest = await CourseAccessRequest.findOne({
      user: req.user.userId,
      course: courseId
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You have already requested access to this course.',
        status: existingRequest.status
      });
    }
    
    // Create new access request
    const accessRequest = new CourseAccessRequest({
      user: req.user.userId,
      course: courseId,
      requestReason
    });
    
    await accessRequest.save();
    
    // Send notification to admin about new access request
    await NotificationService.notifyCourseAccessRequest(accessRequest);
    
    res.status(201).json(accessRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get user's access requests
exports.getMyAccessRequests = async (req, res) => {
  try {
    const requests = await CourseAccessRequest.find({ user: req.user.userId })
      .populate('course', 'title description thumbnailUrl isFree price')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: Get all access requests
exports.getAllAccessRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can view all access requests.' });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const requests = await CourseAccessRequest.find(query)
      .populate('user', 'name email role')
      .populate('course', 'title description thumbnailUrl isFree price')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await CourseAccessRequest.countDocuments(query);
    
    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: skip + requests.length < total,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: Approve access request
exports.approveAccessRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can approve access requests.' });
    }
    
    const accessRequest = await CourseAccessRequest.findById(requestId);
    if (!accessRequest) {
      return res.status(404).json({ message: 'Access request not found.' });
    }
    
    if (accessRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed.' });
    }
    
    accessRequest.status = 'approved';
    accessRequest.adminResponse = adminResponse || 'Access approved.';
    accessRequest.respondedBy = req.user.userId;
    accessRequest.respondedAt = new Date();
    
    await accessRequest.save();
    
    // Send notification to user about approval
    await NotificationService.notifyCourseAccessApproved(accessRequest);
    
    res.json(accessRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: Reject access request
exports.rejectAccessRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;
    
    if (!adminResponse) {
      return res.status(400).json({ message: 'Admin response is required for rejection.' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Only admin can reject access requests.' });
    }
    
    const accessRequest = await CourseAccessRequest.findById(requestId);
    if (!accessRequest) {
      return res.status(404).json({ message: 'Access request not found.' });
    }
    
    if (accessRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed.' });
    }
    
    accessRequest.status = 'rejected';
    accessRequest.adminResponse = adminResponse;
    accessRequest.respondedBy = req.user.userId;
    accessRequest.respondedAt = new Date();
    
    await accessRequest.save();
    
    // Send notification to user about rejection
    await NotificationService.notifyCourseAccessRejected(accessRequest);
    
    res.json(accessRequest);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Check if user has access to a course
exports.checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    
    // Free courses are always accessible
    if (course.isFree) {
      return res.json({ hasAccess: true, reason: 'free_course' });
    }
    
    // Check for approved access request
    const accessRequest = await CourseAccessRequest.findOne({
      user: req.user.userId,
      course: courseId,
      status: 'approved'
    });
    
    if (accessRequest) {
      return res.json({ hasAccess: true, reason: 'approved_request' });
    }
    
    // Check if there's a pending request
    const pendingRequest = await CourseAccessRequest.findOne({
      user: req.user.userId,
      course: courseId,
      status: 'pending'
    });
    
    if (pendingRequest) {
      return res.json({ hasAccess: false, reason: 'pending_request' });
    }
    
    // Check if there's a rejected request
    const rejectedRequest = await CourseAccessRequest.findOne({
      user: req.user.userId,
      course: courseId,
      status: 'rejected'
    });
    
    if (rejectedRequest) {
      return res.json({ 
        hasAccess: false, 
        reason: 'rejected_request',
        adminResponse: rejectedRequest.adminResponse
      });
    }
    
    // No request exists
    return res.json({ hasAccess: false, reason: 'no_request' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 