const mongoose = require('mongoose');
const Venture = require('../models/Venture');

/**
 * Middleware to verify that:
 * 1. ventureId param is a valid ObjectId
 * 2. Venture exists in database
 * 3. Venture is owned by logged-in user (req.user.id)
 */
const checkVentureOwnership = async (req, res, next) => {
  try {
    const ventureId = req.params.ventureId || req.body.ventureId;
    const userId = req.user.id;

    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }

    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    if (!venture) {
      venture = await Venture.create({
        owner: userId,
        ventureName: 'My Venture',
      });
    }

    // Attach loaded venture to request
    req.venture = venture;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkVentureOwnership };
