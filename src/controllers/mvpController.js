const mongoose = require('mongoose');
const MvpScope = require('../models/MvpScope');
const Venture = require('../models/Venture');
const { generateMvpScopeFromGemini } = require('../services/mvpGeminiService');

/**
 * Controller to handle POST /api/mvp-scope/generate
 */
async function generateScope(req, res, next) {
  try {
    const userId = req.user.id;
    let {
      ventureId,
      ventureName,
      idea,
      targetUsers,
      problem,
      alternatives,
      painFrequency,
      differentiation,
      evidence,
      validationScore,
      weakestCategory,
    } = req.body;

    // API Validation
    if (!idea || !idea.trim()) {
      idea = "Validated Startup Idea";
    }

    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    // Auto-fill from Venture memory if fields missing
    if (venture) {
      ventureId = venture._id;
      ventureName = ventureName || venture.ventureName || venture.name || 'Untitled Venture';
      idea = idea || venture.brief?.building || 'New Startup Idea';
      targetUsers = targetUsers || venture.validationState?.answers?.question1 || venture.brief?.audience || 'Target Customers';
      problem = problem || venture.validationState?.answers?.question1 || venture.brief?.problem || 'Core Customer Problem';
      alternatives = alternatives || venture.validationState?.answers?.question2 || venture.brief?.workaround;
      painFrequency = painFrequency || venture.validationState?.answers?.question3 || venture.brief?.outcome;
      differentiation = differentiation || venture.validationState?.answers?.question4;
      evidence = evidence || venture.validationState?.answers?.question5;
      validationScore = validationScore || venture.ideaScore?.overallScore;
    } else {
      ventureName = ventureName || 'Untitled Venture';
      targetUsers = targetUsers || 'Target Customers';
      problem = problem || 'Core Customer Problem';
    }

    // Call Gemini API
    const generatedScope = await generateMvpScopeFromGemini({
      ventureName,
      idea,
      targetUsers,
      problem,
      alternatives,
      painFrequency,
      differentiation,
      evidence,
      validationScore,
      weakestCategory,
    });

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) ? ventureId : (venture ? venture._id : undefined);

    // Save to MongoDB
    const newScope = await MvpScope.create({
      userId,
      ventureId: targetVentureId,
      ventureName,
      idea,
      targetUsers,
      problem,
      generatedScope,
    });

    return res.status(201).json({
      success: true,
      message: 'MVP Scope generated successfully',
      mvpScope: newScope,
    });
  } catch (error) {
    console.error('Error in mvpController generateScope:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/mvp-scope/:ventureId
 */
async function getScopeHistory(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let scopes = [];
    if (ventureId && ventureId !== 'latest' && mongoose.Types.ObjectId.isValid(ventureId)) {
      scopes = await MvpScope.find({ ventureId, userId }).sort({ createdAt: -1 });
    }
    if (!scopes || scopes.length === 0) {
      scopes = await MvpScope.find({ userId }).sort({ createdAt: -1 });
    }

    const latest = scopes[0] || null;

    return res.status(200).json({
      success: true,
      mvpScope: latest,
      history: scopes,
    });
  } catch (error) {
    console.error('Error in mvpController getScopeHistory:', error);
    next(error);
  }
}

module.exports = {
  generateScope,
  getScopeHistory,
};
