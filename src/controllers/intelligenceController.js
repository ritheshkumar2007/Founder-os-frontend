const mongoose = require('mongoose');
const VentureIntelligence = require('../models/VentureIntelligence');
const Venture = require('../models/Venture');
const { generateVentureIntelligenceFromGemini } = require('../services/intelligenceGeminiService');

/**
 * Controller to handle POST /api/intelligence/analyze
 */
async function analyzeVenture(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName } = req.body;

    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    if (venture) {
      ventureId = venture._id;
      ventureName = ventureName || venture.ventureName || venture.name || 'Untitled Venture';
    } else {
      ventureName = ventureName || 'Untitled Venture';
    }

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) ? ventureId : (venture ? venture._id : undefined);

    // Call Gemini Intelligence Service
    const result = await generateVentureIntelligenceFromGemini({
      ventureId: targetVentureId,
      ventureName,
    });

    // Save to MongoDB
    const newIntel = await VentureIntelligence.create({
      userId,
      ventureId: targetVentureId,
      healthScore: result.healthScore,
      startupStage: result.startupStage,
      analysis: result.analysis,
      metrics: result.metrics,
    });

    return res.status(201).json({
      success: true,
      message: 'Venture Intelligence audit completed successfully',
      intelligence: newIntel,
    });
  } catch (error) {
    console.error('Error in intelligenceController analyzeVenture:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/intelligence/:ventureId
 */
async function getIntelligence(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let records = [];
    if (ventureId && ventureId !== 'latest' && mongoose.Types.ObjectId.isValid(ventureId)) {
      records = await VentureIntelligence.find({ ventureId, userId }).sort({ createdAt: -1 });
    }
    if (!records || records.length === 0) {
      records = await VentureIntelligence.find({ userId }).sort({ createdAt: -1 });
    }

    let latest = records[0] || null;

    // If no record exists yet, automatically trigger generation
    if (!latest) {
      let venture = null;
      if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
        venture = await Venture.findOne({ _id: ventureId, owner: userId });
      }
      if (!venture) {
        venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
      }
      const vName = venture ? (venture.ventureName || venture.name) : 'Untitled Venture';
      const targetVentureId = venture ? venture._id : undefined;
      const generated = await generateVentureIntelligenceFromGemini({ ventureId: targetVentureId, ventureName: vName });
      latest = await VentureIntelligence.create({
        userId,
        ventureId: targetVentureId,
        healthScore: generated.healthScore,
        startupStage: generated.startupStage,
        analysis: generated.analysis,
        metrics: generated.metrics,
      });
      records = [latest];
    }

    return res.status(200).json({
      success: true,
      intelligence: latest,
      history: records,
    });
  } catch (error) {
    console.error('Error in intelligenceController getIntelligence:', error);
    next(error);
  }
}

module.exports = {
  analyzeVenture,
  getIntelligence,
};
