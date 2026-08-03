const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeVenture, getIntelligence } = require('../controllers/intelligenceController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/intelligence/analyze
 * @desc    Run Venture Intelligence audit across all 7 workspace models and save to MongoDB
 * @access  Private
 */
router.post('/analyze', analyzeVenture);

/**
 * @route   GET /api/intelligence/:ventureId
 * @desc    Get latest Venture Intelligence assessment and history from MongoDB
 * @access  Private
 */
router.get('/:ventureId', getIntelligence);
router.get('/', getIntelligence);

module.exports = router;
