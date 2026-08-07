const mongoose = require('mongoose');
const InvestorUpdate = require('../models/InvestorUpdate');
const Venture = require('../models/Venture');
const Traction = require('../models/Traction');
const BuildRoadmap = require('../models/BuildRoadmap');
const MarketingPlan = require('../models/MarketingPlan');
const { generateInvestorUpdateFromGemini } = require('../services/investorGeminiService');

/**
 * Controller to handle POST /api/investor-update/generate
 * Dynamically inherits from Venture Memory (Brief -> MVP -> Roadmap -> Marketing -> Traction)
 * without fabricating fake revenue, user metrics, or funding rounds.
 */
async function generateUpdate(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName, overview, progress, traction, challenges, goals, funding } = req.body;

    const isDbConnected = mongoose.connection.readyState === 1;
    let venture = null;
    if (isDbConnected) {
      if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
        venture = await Venture.findOne({ _id: ventureId, owner: userId }).catch(() => null);
      }
      if (!venture) {
        venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 }).catch(() => null);
      }
    }

    const resolvedVentureName = ventureName || venture?.ventureName || venture?.name || 'Untitled Venture';
    const brief = venture?.ideaValidation?.ventureBrief || {};
    const resolvedOverview = overview || brief.building || brief.problemStatement || 'Startup Concept';

    // Auto-inherit real background data across modules if missing
    let resolvedTraction = traction;
    if ((!resolvedTraction || resolvedTraction.includes('142 registered users')) && isDbConnected) {
      const latestTraction = await Traction.findOne({ userId }).sort({ createdAt: -1 }).catch(() => null);
      if (latestTraction?.metrics) {
        const m = latestTraction.metrics;
        if (m.totalUsers > 0 || m.revenue !== '$0 / Pre-Revenue') {
          resolvedTraction = `${m.totalUsers} Total Users, ${m.monthlyActiveUsers} MAU, Revenue: ${m.revenue}, 30-Day Retention: ${m.retentionRate}`;
        } else {
          resolvedTraction = 'Pre-Launch / Pre-Revenue (Zero live users recorded)';
        }
      } else {
        resolvedTraction = 'Pre-Launch / Pre-Traction (Metrics not yet recorded)';
      }
    }

    let resolvedProgress = progress;
    if (!resolvedProgress || resolvedProgress.includes('Deployed core AI modules')) {
      const latestRoadmap = await BuildRoadmap.findOne({ userId }).sort({ createdAt: -1 }).catch(() => null);
      if (latestRoadmap?.roadmap?.overview) {
        resolvedProgress = latestRoadmap.roadmap.overview;
      } else if (venture?.mvpScope?.mustHaveFeatures?.length) {
        resolvedProgress = `MVP Scope finalized with core features: ${venture.mvpScope.mustHaveFeatures.slice(0, 3).join(', ')}`;
      } else {
        resolvedProgress = 'Product architecture designed; engineering MVP development in progress.';
      }
    }

    const resolvedChallenges = challenges && !challenges.includes('Scaling organic direct ICP user acquisition')
      ? challenges
      : 'Customer discovery velocity & establishing first repeatable distribution channel.';

    const resolvedGoals = goals && !goals.includes('Scale to 500 active users & $5,000 MRR')
      ? goals
      : 'Complete core MVP build and onboard first 10–25 active test users.';

    const resolvedFunding = funding && !funding.includes('$500k Pre-Seed')
      ? funding
      : 'Bootstrapping / Pre-Seed discovery (No active funding round configured)';

    const isPreLaunch = resolvedTraction.includes('Pre-Launch') || resolvedTraction.includes('Zero live');

    // Call Gemini AI IR Service
    const aiResult = await generateInvestorUpdateFromGemini({
      ventureName: resolvedVentureName,
      overview: resolvedOverview,
      progress: resolvedProgress,
      traction: resolvedTraction,
      challenges: resolvedChallenges,
      goals: resolvedGoals,
      funding: resolvedFunding,
      isPreLaunch,
    });

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId))
      ? ventureId
      : (venture ? venture._id : '6a709d6ff4af39139e040cc8');

    // Save to MongoDB
    let newUpdate = null;
    if (isDbConnected) {
      newUpdate = await InvestorUpdate.create({
        userId,
        ventureId: targetVentureId,
        ventureName: resolvedVentureName,
        companyOverview: resolvedOverview,
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
      }).catch(() => null);
    }

    if (!newUpdate) {
      newUpdate = {
        _id: '6a709d6ff4af39139e040cc8',
        ventureId: targetVentureId,
        userId,
        companyOverview: resolvedOverview,
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
      };
    }

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

async function getInvestorUpdate(req, res, next) {
  return getUpdateHistory(req, res, next);
}

async function createInvestorUpdate(req, res, next) {
  return generateUpdate(req, res, next);
}

async function updateInvestorUpdate(req, res, next) {
  return generateUpdate(req, res, next);
}

async function getInvestorUpdateText(req, res, next) {
  try {
    const userId = req.user.id;
    const latest = await InvestorUpdate.findOne({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      text: latest?.generatedUpdateText || 'No investor update generated yet.',
    });
  } catch (err) {
    next(err);
  }
}

async function getInvestorUpdateSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const latest = await InvestorUpdate.findOne({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      summary: latest?.investorMessage?.summary || 'No summary available.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateUpdate,
  getUpdateHistory,
  getInvestorUpdate,
  createInvestorUpdate,
  updateInvestorUpdate,
  getInvestorUpdateText,
  getInvestorUpdateSummary,
};
