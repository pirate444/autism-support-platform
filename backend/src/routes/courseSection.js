const express = require('express');
const router = express.Router();
const courseSectionController = require('../controllers/courseSectionController');
const auth = require('../middleware/authMiddleware');

// Section routes
router.post('/', auth, courseSectionController.createSection);
router.get('/course/:courseId', auth, courseSectionController.getCourseSections);
router.put('/:id', auth, courseSectionController.updateSection);
router.delete('/:id', auth, courseSectionController.deleteSection);
router.put('/course/:courseId/reorder', auth, courseSectionController.reorderSections);

module.exports = router; 