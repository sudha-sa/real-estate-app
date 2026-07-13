const express = require('express');
const router = express.Router();
const { bookVisit, getVisits, rescheduleVisit, cancelVisit } = require('../controllers/visitController');
const { protect } = require('../middleware/auth');

router.post('/', protect, bookVisit);
router.get('/', protect, getVisits);
router.put('/:id/reschedule', protect, rescheduleVisit);
router.delete('/:id', protect, cancelVisit);

module.exports = router;
