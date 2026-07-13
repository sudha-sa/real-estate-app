const express = require('express');
const router = express.Router();
const { aiChat, aiQuestionnaire, getSmartSuggestions, getQuestionnaire } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat', protect, aiChat);
router.post('/questionnaire', protect, aiQuestionnaire);
router.get('/suggestions', protect, getSmartSuggestions);
router.get('/questionnaire/questions', protect, getQuestionnaire);

module.exports = router;
