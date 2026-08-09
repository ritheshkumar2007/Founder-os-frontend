const mongoose = require('mongoose');
const MarketingPlan = require('../models/MarketingPlan');
const Venture = require('../models/Venture');
const { generateMarketingPlanFromGemini } = require('../services/marketingGeminiService');

/**
 * Controller to handle POST /api/marketing-plan/generate
 */
async function generatePlan(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName, startupIdea, mvpScope, audience, industry, pricing, goal } = req.body;

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
      startupIdea = startupIdea || venture.brief?.building || 'New Startup Idea';
      mvpScope = mvpScope || venture.mvp?.job || '2-week core MVP scope';
      audience = audience || venture.brief?.audience || 'Target Customers';
      industry = industry || 'B2B SaaS / Technology';
      pricing = pricing || 'Freemium / Monthly Subscription';
      goal = goal || 'Acquire first 100 active users in 30 days';
    } else {
      ventureName = ventureName || 'Untitled Venture';
      startupIdea = startupIdea || 'New Startup Idea';
      mvpScope = mvpScope || '2-week core MVP scope';
      audience = audience || 'Target Customers';
      industry = industry || 'B2B SaaS / Technology';
      pricing = pricing || 'Freemium / Monthly Subscription';
      goal = goal || 'Acquire first 100 active users in 30 days';
    }

    // Call Gemini CMO Service
    const generatedStrategy = await generateMarketingPlanFromGemini({
      ventureName,
      idea: startupIdea,
      mvpScope,
      audience,
      industry,
      pricing,
      goal,
    });

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) ? ventureId : (venture ? venture._id : undefined);

    // Save to MongoDB
    const newPlan = await MarketingPlan.create({
      userId,
      ventureId: targetVentureId,
      ventureName,
      startupIdea,
      targetAudience: audience,
      marketingStrategy: generatedStrategy,
    });

    return res.status(201).json({
      success: true,
      message: 'Marketing Plan generated successfully',
      marketingPlan: newPlan,
    });
  } catch (error) {
    console.error('Error in marketingController generatePlan:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/marketing-plan/:ventureId
 */
async function getPlanHistory(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let plans = [];
    if (ventureId && ventureId !== 'latest' && mongoose.Types.ObjectId.isValid(ventureId)) {
      plans = await MarketingPlan.find({ ventureId, userId }).sort({ createdAt: -1 });
    }
    if (!plans || plans.length === 0) {
      plans = await MarketingPlan.find({ userId }).sort({ createdAt: -1 });
    }

    const latest = plans[0] || null;

    return res.status(200).json({
      success: true,
      marketingPlan: latest,
      history: plans,
    });
  } catch (error) {
    console.error('Error in marketingController getPlanHistory:', error);
    next(error);
  }
}

module.exports = {
  generatePlan,
  getPlanHistory,
};
