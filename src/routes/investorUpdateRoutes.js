const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateUpdate, getUpdateHistory } = require('../controllers/investorUpdateController');

const router = express.Router();

router.use(protect);

/**
 * @route   POST /api/investor-update/generate
 * @desc    Generate an investor update memorandum using Gemini API and save to MongoDB
 * @access  Private
 */
router.post('/generate', generateUpdate);

/**
 * @route   GET /api/investor-update/history
 * @desc    Get investor update history from MongoDB
 * @access  Private
 */
router.get('/history', getUpdateHistory);
router.get('/history/:ventureId', getUpdateHistory);
router.get('/:ventureId', getUpdateHistory);

module.exports = router;
