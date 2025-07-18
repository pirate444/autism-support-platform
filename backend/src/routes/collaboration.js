const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const auth = require('../middleware/authMiddleware');

// ===== NOTES ROUTES =====
router.post('/notes', auth, collaborationController.createNote);
router.get('/notes/student/:studentId', auth, collaborationController.getNotesByStudent);
router.put('/notes/:id', auth, collaborationController.updateNote);
router.delete('/notes/:id', auth, collaborationController.deleteNote);

// ===== APPOINTMENTS ROUTES =====
router.post('/appointments', auth, collaborationController.createAppointment);
router.get('/appointments', auth, collaborationController.getAppointments);
router.put('/appointments/:id/status', auth, collaborationController.updateAppointmentStatus);
router.delete('/appointments/:id', auth, collaborationController.deleteAppointment);

// ===== PROGRESS REPORTS ROUTES =====
router.post('/progress-reports', auth, collaborationController.createProgressReport);
router.get('/progress-reports/student/:studentId', auth, collaborationController.getProgressReportsByStudent);
router.put('/progress-reports/:id', auth, collaborationController.updateProgressReport);
router.delete('/progress-reports/:id', auth, collaborationController.deleteProgressReport);

module.exports = router; 