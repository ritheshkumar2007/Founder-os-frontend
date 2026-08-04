const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateRoadmap, getRoadmapHistory } = require('../controllers/roadmapController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/build-roadmap/generate
 * @desc    Generate a complete software development roadmap using Gemini CTO prompt and save to MongoDB
 * @access  Private
 */
router.post('/generate', generateRoadmap);

/**
 * @route   GET /api/build-roadmap/:ventureId
 * @desc    Get latest Build Roadmap and history from MongoDB
 * @access  Private
 */
router.get('/:ventureId', getRoadmapHistory);

module.exports = router;
