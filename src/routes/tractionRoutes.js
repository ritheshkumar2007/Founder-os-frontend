const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { analyzeTraction, getTractionHistory } = require('../controllers/tractionController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/traction/analyze
 * @desc    Analyze startup metrics with Gemini AI and save to MongoDB
 * @access  Private
 */
router.post('/analyze', analyzeTraction);

/**
 * @route   GET /api/traction/history
 * @desc    Get traction history and latest analysis from MongoDB
 * @access  Private
 */
router.get('/history', getTractionHistory);
router.get('/history/:ventureId', getTractionHistory);
router.get('/:ventureId', getTractionHistory);

module.exports = router;
