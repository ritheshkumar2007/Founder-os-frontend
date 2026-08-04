const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const { getMarketingPlanForVenture, generateMarketingPlan, updateMarketingPlan } = require('../services/marketingService');

const router = express.Router();
router.use(protect);

router.get('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    if (!venture) return res.status(404).json({ success: false, message: 'Venture not found' });

    const marketingPlan = await getMarketingPlanForVenture(venture._id, userId, venture);
    return res.status(200).json({ success: true, marketingPlan });
  } catch (error) {
    next(error);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const { ventureId } = req.body;
    const userId = req.user.id;
    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    if (!venture) return res.status(404).json({ success: false, message: 'Venture not found' });

    const marketingPlan = await generateMarketingPlan({ venture, userId });
    return res.status(200).json({ success: true, message: 'Marketing plan generated', marketingPlan });
  } catch (error) {
    next(error);
  }
});

router.put('/:ventureId', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    let targetVentureId = ventureId;
    if (!ventureId || !mongoose.Types.ObjectId.isValid(ventureId)) {
      const venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
      if (venture) targetVentureId = venture._id;
    }
    const marketingPlan = await updateMarketingPlan(targetVentureId, userId, req.body);
    return res.status(200).json({ success: true, marketingPlan });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
