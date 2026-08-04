const mongoose = require('mongoose');
const Traction = require('../models/Traction');
const Venture = require('../models/Venture');
const { analyzeTractionWithGemini } = require('../services/tractionGeminiService');

/**
 * Controller to handle POST /api/traction/analyze
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

    const metricsObj = {
      totalUsers: Number(totalUsers) || 120,
      monthlyActiveUsers: Number(monthlyActiveUsers) || 85,
      newUsers: Number(newUsers) || 35,
      revenue: String(revenue || '$1,250/mo'),
      conversionRate: String(conversionRate || '4.2%'),
      retentionRate: String(retentionRate || '68%'),
      customerAcquisitionChannels: Array.isArray(customerAcquisitionChannels)
        ? customerAcquisitionChannels
        : (typeof customerAcquisitionChannels === 'string' ? customerAcquisitionChannels.split(',') : ['LinkedIn', 'Product Hunt', 'Organic Referral']),
    };

    const feedbackText = customerFeedback || 'Users love instant roadmap generation; asking for export options.';

    // Call Gemini AI
    const aiAnalysis = await analyzeTractionWithGemini({
      ventureName,
      metrics: metricsObj,
      feedback: feedbackText,
      goal: growthGoal || 'Reach 500 active users & $5k MRR in 60 days',
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
    });

    return res.status(201).json({
      success: true,
      message: 'Traction analysis completed successfully',
      traction: newTraction,
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
