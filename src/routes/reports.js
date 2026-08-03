const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const {
  getAllVentureReports,
  getReportTypeHistory,
  generateAllReportsForVenture,
} = require('../services/reportService');
const { getConversationHistory } = require('../services/memoryService');

const router = express.Router();

// Require JWT authentication for all reports routes
router.use(protect);

/**
 * @route   GET /api/reports/:ventureId
 * @desc    Get latest versions of all 7 report types for a venture
 * @access  Private
 */
router.get('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const reports = await getAllVentureReports(ventureId);

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/reports/:ventureId/type/:type
 * @desc    Get version history for a specific report type
 * @access  Private
 */
router.get('/:ventureId/type/:type', async (req, res, next) => {
  try {
    const { ventureId, type } = req.params;
    const history = await getReportTypeHistory(ventureId, type);

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/reports/:ventureId/generate
 * @desc    Trigger manual generation of all 7 reports for a venture
 * @access  Private
 */
router.post('/:ventureId/generate', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    const venture = await Venture.findOne({ _id: ventureId, owner: userId });
    if (!venture) {
      return res.status(404).json({
        success: false,
        message: 'Venture not found',
      });
    }

    const conversationHistory = await getConversationHistory({ userId, ventureId });

    const reports = await generateAllReportsForVenture({
      venture,
      userId,
      history: conversationHistory,
    });

    return res.status(200).json({
      success: true,
      message: 'Venture reports updated successfully',
      reports,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
