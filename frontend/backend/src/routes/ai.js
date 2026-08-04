const express = require('express');
const { aiChat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Send message to Gemini AI startup coach
// @access  Private
router.post('/chat', protect, aiChat);

module.exports = router;
