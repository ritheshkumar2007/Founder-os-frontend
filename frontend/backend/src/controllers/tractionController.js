const mongoose = require('mongoose');
const Traction = require('../models/Traction');
const Venture = require('../models/Venture');
const { analyzeTractionWithGemini } = require('../services/tractionGeminiService');

/**
 * Controller to handle POST /api/traction/analyze
 * Honestly evaluates actual startup traction data without inventing fake revenue or user metrics.
 */
async function analyzeTraction(req, res, next) {
  try {
    const userId = req.user.id;
    let {
      ventureId,
      ventureName,
      totalUsers,
      monthlyActiveUsers,
      newUsers,
      revenue,
      conversionRate,
      retentionRate,
      customerAcquisitionChannels,
      customerFeedback,
      growthGoal,
    } = req.body;

    let venture = null;
    if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId }).catch(() => null);
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 }).catch(() => null);
    }

    if (venture) {
      ventureId = venture._id;
      ventureName = ventureName || venture.ventureName || venture.name || 'Untitled Venture';
    } else {
      ventureName = ventureName || 'Untitled Venture';
    }

    const numTotal = Number(totalUsers) || 0;
    const numMau = Number(monthlyActiveUsers) || 0;
    const numNew = Number(newUsers) || 0;
    const cleanRev = (revenue || '').trim();
    const cleanConv = (conversionRate || '').trim();
    const cleanRet = (retentionRate || '').trim();

    const isPreTraction = numTotal === 0 && numMau === 0 && (!cleanRev || cleanRev === '$0' || cleanRev === '$0/mo');

    const metricsObj = {
      totalUsers: numTotal,
      monthlyActiveUsers: numMau,
      newUsers: numNew,
      revenue: cleanRev || (isPreTraction ? '$0 / Pre-Revenue' : 'Not recorded'),
      conversionRate: cleanConv || (isPreTraction ? 'Not yet recorded' : '0%'),
      retentionRate: cleanRet || (isPreTraction ? 'Not yet recorded' : '0%'),
      customerAcquisitionChannels: Array.isArray(customerAcquisitionChannels) && customerAcquisitionChannels.length > 0
        ? customerAcquisitionChannels
        : (typeof customerAcquisitionChannels === 'string' && customerAcquisitionChannels.trim()
          ? customerAcquisitionChannels.split(',').map((s) => s.trim())
          : ['No acquisition channels configured']),
    };

    const feedbackText = customerFeedback && customerFeedback.trim()
      ? customerFeedback
      : (isPreTraction ? 'No customer feedback submitted yet.' : 'Early customer interviews in progress.');

    const resolvedGoal = growthGoal && growthGoal.trim()
      ? growthGoal
      : (isPreTraction ? 'Acquire first 10–25 active test users' : 'Scale monthly active users');

    // Call Gemini AI with honest context
    const aiAnalysis = await analyzeTractionWithGemini({
      ventureName,
      metrics: metricsObj,
      feedback: feedbackText,
      goal: resolvedGoal,
      isPreTraction,
    });

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) ? ventureId : (venture ? venture._id : undefined);

    // Save to MongoDB
    const newTraction = await Traction.create({
      userId,
      ventureId: targetVentureId,
      ventureName,
      metrics: metricsObj,
      customerInsights: [feedbackText],
      aiAnalysis,
    }).catch(() => null);

    return res.status(201).json({
      success: true,
      message: isPreTraction ? 'Pre-Traction audit completed successfully' : 'Traction analysis completed successfully',
      traction: newTraction || {
        ventureName,
        metrics: metricsObj,
        customerInsights: [feedbackText],
        aiAnalysis,
      },
    });
  } catch (error) {
    console.error('Error in tractionController analyzeTraction:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/traction/history
 */
async function getTractionHistory(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let tractions = [];
    if (ventureId && ventureId !== 'history' && ventureId !== 'latest' && mongoose.Types.ObjectId.isValid(ventureId)) {
      tractions = await Traction.find({ ventureId, userId }).sort({ createdAt: -1 });
    }
    if (!tractions || tractions.length === 0) {
      tractions = await Traction.find({ userId }).sort({ createdAt: -1 });
    }

    const latest = tractions[0] || null;

    return res.status(200).json({
      success: true,
      traction: latest,
      history: tractions,
    });
  } catch (error) {
    console.error('Error in tractionController getTractionHistory:', error);
    next(error);
  }
}

module.exports = {
  analyzeTraction,
  getTractionHistory,
};
