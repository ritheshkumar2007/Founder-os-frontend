const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateScope, getScopeHistory } = require('../controllers/mvpController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/mvp-scope/generate
 * @desc    Generate a new AI MVP Scope blueprint using Gemini and save to MongoDB
 * @access  Private
 */
router.post('/generate', generateScope);

/**
 * @route   GET /api/mvp-scope/:ventureId
 * @desc    Get latest MVP Scope blueprint and history from MongoDB
 * @access  Private
 */
router.get('/:ventureId', getScopeHistory);

module.exports = router;
