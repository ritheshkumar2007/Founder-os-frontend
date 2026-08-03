const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generatePlan, getPlanHistory } = require('../controllers/marketingController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/marketing-plan/generate
 * @desc    Generate a complete 10-part marketing plan using Gemini CMO prompt and save to MongoDB
 * @access  Private
 */
router.post('/generate', generatePlan);

/**
 * @route   GET /api/marketing-plan/:ventureId
 * @desc    Get latest Marketing Plan and history from MongoDB
 * @access  Private
 */
router.get('/:ventureId', getPlanHistory);

module.exports = router;
