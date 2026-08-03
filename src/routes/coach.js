const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getCoachDashboardData,
  toggleRecommendationStatus,
} = require('../services/coachService');

const router = express.Router();

// Require JWT authentication for all coach routes
router.use(protect);

/**
 * @route   GET /api/coach/:ventureId
 * @desc    Get dashboard widget data & coaching recommendations for a venture
 * @access  Private
 */
router.get('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    const data = await getCoachDashboardData({ ventureId, userId });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No coaching data found for this venture',
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/coach/:ventureId/recommendation/:id
 * @desc    Update recommendation status (COMPLETED / PENDING)
 * @access  Private
 */
router.patch('/:ventureId/recommendation/:id', async (req, res, next) => {
  try {
    const { ventureId, id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const updatedDoc = await toggleRecommendationStatus({
      ventureId,
      userId,
      recommendationId: id,
      status,
    });

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found or could not be updated',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recommendation status updated successfully',
      data: updatedDoc,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
