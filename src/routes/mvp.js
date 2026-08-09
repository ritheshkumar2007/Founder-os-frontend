const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const {
  getMvpScopeForVenture,
  generateMvpScope,
  updateMvpScope,
} = require('../services/mvpService');

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/mvp/:ventureId
 * @desc    Fetch saved MVP Scope from MongoDB (automatically generates if not present)
 * @access  Private
 */
router.get('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    if (!venture) {
      return res.status(404).json({ success: false, message: 'Venture not found' });
    }

    const mvpScope = await getMvpScopeForVenture(venture._id, userId, venture);

    return res.status(200).json({
      success: true,
      mvpScope,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/mvp/generate
 * @desc    Regenerate MVP Scope using Gemini AI and overwrite previous version in MongoDB
 * @access  Private
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { ventureId } = req.body;
    const userId = req.user.id;

    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    if (!venture) {
      return res.status(404).json({ success: false, message: 'Venture not found' });
    }

    const mvpScope = await generateMvpScope({ venture, userId });

    return res.status(200).json({
      success: true,
      message: 'MVP Scope regenerated successfully',
      mvpScope,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/mvp/:ventureId
 * @desc    Persist manual edits, feature additions, or feature deletions to MongoDB
 * @access  Private
 */
router.put('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    let targetVentureId = ventureId;
    if (!ventureId || !mongoose.Types.ObjectId.isValid(ventureId)) {
      const venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
      if (venture) targetVentureId = venture._id;
    }
    const { coreGoal, features } = req.body;

    const updatedMvp = await updateMvpScope(targetVentureId, userId, { coreGoal, features });

    return res.status(200).json({
      success: true,
      mvpScope: updatedMvp,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
