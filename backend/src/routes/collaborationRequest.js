const express = require('express');
const router = express.Router();
const collaborationRequestController = require('../controllers/collaborationRequestController');
const auth = require('../middleware/authMiddleware');

// Create a collaboration request
router.post('/', auth, collaborationRequestController.createRequest);

// Get all requests (admin only)
router.get('/all', auth, collaborationRequestController.getAllRequests);

// Get my requests
router.get('/my', auth, collaborationRequestController.getMyRequests);

// Update request status (approve/reject)
router.put('/:id/status', auth, collaborationRequestController.updateRequestStatus);

// Check collaboration access for a student
router.get('/access/:studentId', auth, collaborationRequestController.checkCollaborationAccess);

// Debug endpoint (temporary)
router.get('/debug/all', auth, collaborationRequestController.debugAllRequests);

module.exports = router; 