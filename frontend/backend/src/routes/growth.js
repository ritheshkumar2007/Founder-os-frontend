const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const {
  upsertGrowthMetrics,
  analyzeGrowthAndRecommendations,
  analyzeAndGroupFeedback,
  generateGrowthContent,
  getLatestGrowthData,
} = require('../services/growthService');

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/growth/:ventureId
 * @desc    Get growth metrics, growth score, bottleneck, recommendations, and customer feedback
 * @access  Private
 */
router.get('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let growthData = await getLatestGrowthData(ventureId);

    if (!growthData?.metrics) {
      const venture = await Venture.findOne({ _id: ventureId, owner: userId });
      if (venture) {
        await analyzeGrowthAndRecommendations({ venture, userId });
        growthData = await getLatestGrowthData(ventureId);
      }
    }

    return res.status(200).json({ success: true, growth: growthData });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/growth/:ventureId/metrics
 * @desc    Update startup metrics (Visitors, Signups, Activated Users, Paying Customers, Revenue, Retention)
 * @access  Private
 */
router.post('/:ventureId/metrics', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const { metrics } = req.body;

    const venture = await Venture.findOne({ _id: ventureId, owner: userId });
    if (!venture) {
      return res.status(404).json({ success: false, message: 'Venture not found' });
    }

    await upsertGrowthMetrics({ ventureId, userId, metrics });
    const updatedAnalysis = await analyzeGrowthAndRecommendations({ venture, userId });

    return res.status(200).json({ success: true, growth: updatedAnalysis });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/growth/:ventureId/feedback
 * @desc    Submit raw customer feedback to analyze and group into themes
 * @access  Private
 */
router.post('/:ventureId/feedback', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const { rawText, customerSegment } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Raw feedback text is required.' });
    }

    const feedbackDoc = await analyzeAndGroupFeedback({
      ventureId,
      userId,
      rawText,
      customerSegment,
    });

    return res.status(201).json({ success: true, feedback: feedbackDoc });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/growth/:ventureId/content
 * @desc    Generate AI marketing/launch copy in AI Content Studio
 * @access  Private
 */
router.post('/:ventureId/content', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const { contentType } = req.body;

    const venture = await Venture.findOne({ _id: ventureId, owner: userId });
    if (!venture) {
      return res.status(404).json({ success: false, message: 'Venture not found' });
    }

    const content = await generateGrowthContent({
      venture,
      contentType: contentType || 'landing_page',
    });

    return res.status(200).json({ success: true, contentType, content });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
