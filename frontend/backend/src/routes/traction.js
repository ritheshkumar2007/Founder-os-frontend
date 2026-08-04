const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const { getTractionDataForVenture, generateTractionData, updateTractionData } = require('../services/tractionService');

const router = express.Router({ mergeParams: true });
router.use(protect);

const getPlan = async (req, res, next) => {
  try {
    const ventureId = req.params.ventureId || req.query.ventureId;
    const userId = req.user.id;
    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });

    const tractionData = await getTractionDataForVenture(venture?._id || ventureId, userId, venture);
    return res.status(200).json({ success: true, tractionData });
  } catch (error) {
    next(error);
  }
};

const genPlan = async (req, res, next) => {
  try {
    const ventureId = req.params.ventureId || req.body?.ventureId;
    const userId = req.user.id;
    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });

    const tractionData = await generateTractionData({ venture, userId });
    return res.status(200).json({ success: true, message: 'Traction dashboard generated', tractionData });
  } catch (error) {
    next(error);
  }
};

const putPlan = async (req, res, next) => {
  try {
    const ventureId = req.params.ventureId || req.body?.ventureId;
    const userId = req.user.id;
    let targetVentureId = ventureId;
    if (!ventureId || !mongoose.Types.ObjectId.isValid(ventureId)) {
      const venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
      if (venture) targetVentureId = venture._id;
    }
    const tractionData = await updateTractionData(targetVentureId, userId, req.body);
    return res.status(200).json({ success: true, tractionData });
  } catch (error) {
    next(error);
  }
};

router.route('/')
  .get(getPlan)
  .post(genPlan)
  .put(putPlan);

router.route('/:ventureId')
  .get(getPlan)
  .put(putPlan);

router.post('/generate', genPlan);

module.exports = router;
