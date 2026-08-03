const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { handleChat, getHistory } = require('../controllers/founderAIController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/founder-ai/chat
 * @desc    Send message to FounderOS AI Co-Founder with full 7-module context & save conversation
 * @access  Private
 */
router.post('/chat', handleChat);

/**
 * @route   GET /api/founder-ai/history
 * @desc    Get AI Co-Founder conversation history and live startup context
 * @access  Private
 */
router.get('/history', getHistory);

module.exports = router;
