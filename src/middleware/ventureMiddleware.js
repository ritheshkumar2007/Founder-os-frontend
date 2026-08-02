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

    if (!ventureId || !mongoose.Types.ObjectId.isValid(ventureId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Venture ID format',
      });
    }

    const venture = await Venture.findById(ventureId);

    if (!venture) {
      return res.status(404).json({
        success: false,
        message: 'Venture not found',
      });
    }

    // Verify ownership
    if (venture.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this venture',
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
