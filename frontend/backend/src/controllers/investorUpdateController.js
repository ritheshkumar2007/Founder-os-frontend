const mongoose = require('mongoose');
const InvestorUpdate = require('../models/InvestorUpdate');
const Venture = require('../models/Venture');
const Traction = require('../models/Traction');
const BuildRoadmap = require('../models/BuildRoadmap');
const MarketingPlan = require('../models/MarketingPlan');
const LaunchSprint = require('../models/LaunchSprint');
const { generateInvestorUpdateFromGemini } = require('../services/investorGeminiService');

/**
 * Controller to handle POST /api/investor-update/generate
 */
async function generateUpdate(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName, overview, progress, traction, challenges, goals, funding } = req.body;

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
      overview = overview || venture.brief?.building || 'AI Execution OS for Founders';
    } else {
      ventureName = ventureName || 'Untitled Venture';
      overview = overview || 'AI Execution OS for Founders';
    }

    // Attempt to pull real background data across modules if missing
    if (!traction && ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      const latestTraction = await Traction.findOne({ ventureId, userId }).sort({ createdAt: -1 });
      if (latestTraction?.metrics) {
        traction = `${latestTraction.metrics.totalUsers} Total Users, ${latestTraction.metrics.monthlyActiveUsers} MAU, Revenue: ${latestTraction.metrics.revenue}, Retention: ${latestTraction.metrics.retentionRate}`;
      }
    }
    if (!progress && ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      const latestRoadmap = await BuildRoadmap.findOne({ ventureId, userId }).sort({ createdAt: -1 });
      if (latestRoadmap?.roadmap?.overview) {
        progress = latestRoadmap.roadmap.overview;
      }
    }

    traction = traction || '142 registered users, 98 MAU, $2,450 MRR, 72% retention rate';
    progress = progress || 'Deployed core AI modules and MongoDB Atlas persistence engine';
    challenges = challenges || 'Scaling organic direct ICP user acquisition';
    goals = goals || 'Scale to 500 active users & $5,000 MRR in next quarter';
    funding = funding || 'Raising $500k Pre-Seed round';

    // Call Gemini AI IR Service
    const aiResult = await generateInvestorUpdateFromGemini({
      ventureName,
      overview,
      progress,
      traction,
      challenges,
      goals,
      funding,
    });

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) ? ventureId : (venture ? venture._id : undefined);

    // Save to MongoDB
    const newUpdate = await InvestorUpdate.create({
      userId,
      ventureId: targetVentureId,
      ventureName,
      companyOverview: overview,
      period: {
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        quarter: `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
      },
      startupProgress: {
        milestones: aiResult.keyAchievements,
        productUpdates: aiResult.productUpdates,
        tractionHighlights: aiResult.growthMetrics,
        revenueUpdates: aiResult.revenueUpdates,
      },
      investorMessage: {
        summary: aiResult.summary,
        keyAchievements: aiResult.keyAchievements,
        growthMetrics: aiResult.growthMetrics,
        challenges: aiResult.challenges,
        solutions: aiResult.solutions,
        nextQuarterGoals: aiResult.nextQuarterGoals,
        fundingNeeds: aiResult.fundingNeeds,
      },
      generatedUpdateText: aiResult.generatedUpdateText,
    });

    return res.status(201).json({
      success: true,
      message: 'Investor Update generated successfully',
      investorUpdate: newUpdate,
    });
  } catch (error) {
    console.error('Error in investorUpdateController generateUpdate:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/investor-update/history
 */
async function getUpdateHistory(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let updates = [];
    if (ventureId && ventureId !== 'history' && ventureId !== 'latest' && mongoose.Types.ObjectId.isValid(ventureId)) {
      updates = await InvestorUpdate.find({ ventureId, userId }).sort({ createdAt: -1 });
    }
    if (!updates || updates.length === 0) {
      updates = await InvestorUpdate.find({ userId }).sort({ createdAt: -1 });
    }

    const latest = updates[0] || null;

    return res.status(200).json({
      success: true,
      investorUpdate: latest,
      history: updates,
    });
  } catch (error) {
    console.error('Error in investorUpdateController getUpdateHistory:', error);
    next(error);
  }
}

module.exports = {
  generateUpdate,
  getUpdateHistory,
};
