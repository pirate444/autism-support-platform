const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const admin = require('../middleware/adminMiddleware');

// Create a new student - only teachers, parents, and trainers
router.post('/', auth, role(['school_support_assistant', 'parent', 'specialist_educator']), studentController.createStudent);

// Get all students
router.get('/', auth, studentController.getAllStudents);

// Get students assigned to the current user (for doctors and other professionals)
router.get('/my-assigned', auth, studentController.getMyAssignedStudents);

// Get unassigned students for parents to claim
router.get('/unassigned', auth, studentController.getUnassignedStudents);

// Allow parents to assign themselves to a student
router.post('/:studentId/assign-self', auth, studentController.assignSelfToStudent);

// Search student by ministry code for collaboration requests
router.get('/search-for-collaboration', auth, studentController.searchStudentForCollaboration);

// Get a student by ministry code
router.get('/code/:code', auth, role(['ministry_staff', 'child_psychiatrist', 'parent', 'specialist_educator', 'psychologist', 'speech_therapist', 'occupational_therapist', 'school_support_assistant']), studentController.getStudentByCode);

// Assign users to a student - admin only
router.post('/:studentId/assign', auth, admin, studentController.assignUsers);

// Delete a student (only creator or admin)
router.delete('/:id', auth, studentController.deleteStudent);

module.exports = router; 