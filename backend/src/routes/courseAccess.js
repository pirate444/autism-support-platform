const express = require('express');
const router = express.Router();
const courseAccessController = require('../controllers/courseAccessController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// User routes
router.post('/request', courseAccessController.requestAccess);
router.get('/my-requests', courseAccessController.getMyAccessRequests);
router.get('/check/:courseId', courseAccessController.checkCourseAccess);

// Admin routes
router.get('/all', courseAccessController.getAllAccessRequests);
router.put('/:requestId/approve', courseAccessController.approveAccessRequest);
router.put('/:requestId/reject', courseAccessController.rejectAccessRequest);

module.exports = router; 