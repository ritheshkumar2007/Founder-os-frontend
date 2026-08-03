const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateSprint, getSprintHistory } = require('../controllers/launchSprintController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/launch-sprint/generate
 * @desc    Generate a complete launch sprint execution plan using Gemini API and save to MongoDB
 * @access  Private
 */
router.post('/generate', generateSprint);

/**
 * @route   GET /api/launch-sprint/:ventureId
 * @desc    Get latest Launch Sprint and history from MongoDB
 * @access  Private
 */
router.get('/:ventureId', getSprintHistory);

module.exports = router;
