const MvpScope = require('../models/MvpScope');
const Venture = require('../models/Venture');
const { generateMvpScopeFromGemini } = require('../services/mvpGeminiService');

/**
 * Controller to handle POST /api/mvp-scope/generate
 */
async function generateScope(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName, idea, targetUsers, problem } = req.body;

    // API Validation
    if (!idea || !idea.trim()) {
      return res.status(400).json({ success: false, message: 'Startup idea is required.' });
    }

    let venture = null;
    if (ventureId) {
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
      targetUsers = targetUsers || venture.brief?.audience || 'Target Customers';
      problem = problem || venture.brief?.problem || 'Core Customer Problem';
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
    });

    // Save to MongoDB
    const newScope = await MvpScope.create({
      userId,
      ventureId: ventureId || undefined,
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
    if (ventureId && ventureId !== 'latest') {
      scopes = await MvpScope.find({ ventureId, userId }).sort({ createdAt: -1 });
    } else {
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
