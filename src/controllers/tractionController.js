const { validationResult } = require('express-validator');

/**
 * Calculate automated traction metrics and stage classification
 * @param {Object} inputs - Raw founder traction inputs
 * @returns {Object} Calculated metrics object
 */
const calculateTractionMetrics = ({
  peopleContacted = 0,
  mvpUsers = 0,
  payingUsers = 0,
  monthlyRevenue = 0,
}) => {
  const contacted = Number(peopleContacted) || 0;
  const mvp = Number(mvpUsers) || 0;
  const paying = Number(payingUsers) || 0;
  const revenue = Number(monthlyRevenue) || 0;

  // 1. Contact to User Conversion (%)
  const contactToUserConversion =
    contacted > 0 ? Number(((mvp / contacted) * 100).toFixed(1)) : 0;

  // 2. User to Paying Conversion (%)
  const userToPayingConversion =
    mvp > 0 ? Number(((paying / mvp) * 100).toFixed(1)) : 0;

  // 3. Revenue Per Paying User ($)
  const revenuePerPayingUser =
    paying > 0 ? Number((revenue / paying).toFixed(2)) : 0;

  // 4. Current Traction Stage Classification Rules:
  // - If mvpUsers == 0 -> Pre-Launch
  // - Else if mvpUsers > 0 && payingUsers == 0 -> Early Validation
  // - Else if payingUsers >= 1 && monthlyRevenue < 1000 -> First Revenue
  // - Else if monthlyRevenue >= 1000 -> Growing Startup
  let currentTractionStage = 'Pre-Launch';

  if (mvp === 0) {
    currentTractionStage = 'Pre-Launch';
  } else if (mvp > 0 && paying === 0) {
    currentTractionStage = 'Early Validation';
  } else if (paying >= 1 && revenue < 1000) {
    currentTractionStage = 'First Revenue';
  } else if (revenue >= 1000) {
    currentTractionStage = 'Growing Startup';
  }

  return {
    contactToUserConversion,
    userToPayingConversion,
    revenuePerPayingUser,
    currentTractionStage,
  };
};

/**
 * Helper to format traction response object
 */
const formatTractionResponse = (traction) => {
  return {
    peopleContacted: traction.peopleContacted || 0,
    customerInterviews: traction.customerInterviews || 0,
    waitlistSignups: traction.waitlistSignups || 0,
    mvpUsers: traction.mvpUsers || 0,
    activeUsers: traction.activeUsers || 0,
    payingUsers: traction.payingUsers || 0,
    monthlyRevenue: traction.monthlyRevenue || 0,
    metrics: {
      contactToUserConversion: traction.metrics?.contactToUserConversion || 0,
      userToPayingConversion: traction.metrics?.userToPayingConversion || 0,
      revenuePerPayingUser: traction.metrics?.revenuePerPayingUser || 0,
      currentTractionStage: traction.metrics?.currentTractionStage || 'Pre-Launch',
    },
    history: (traction.history || []).map((h) => ({
      _id: h._id,
      date: h.date,
      peopleContacted: h.peopleContacted,
      customerInterviews: h.customerInterviews,
      waitlistSignups: h.waitlistSignups,
      mvpUsers: h.mvpUsers,
      activeUsers: h.activeUsers,
      payingUsers: h.payingUsers,
      monthlyRevenue: h.monthlyRevenue,
      currentTractionStage: h.currentTractionStage,
    })),
    createdAt: traction.createdAt,
    updatedAt: traction.updatedAt,
  };
};

/**
 * @desc    Get Traction Dashboard data
 * @route   GET /api/ventures/:ventureId/traction
 * @access  Private (Owner only)
 */
const getTraction = async (req, res, next) => {
  try {
    const traction = req.venture.traction;

    if (!traction || !traction.isSaved) {
      // Return default empty traction object with default metrics
      const defaultMetrics = calculateTractionMetrics({
        peopleContacted: 0,
        mvpUsers: 0,
        payingUsers: 0,
        monthlyRevenue: 0,
      });

      return res.status(200).json({
        success: true,
        traction: {
          peopleContacted: 0,
          customerInterviews: 0,
          waitlistSignups: 0,
          mvpUsers: 0,
          activeUsers: 0,
          payingUsers: 0,
          monthlyRevenue: 0,
          metrics: defaultMetrics,
          history: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      traction: formatTractionResponse(traction),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update Traction Dashboard data
 * @route   POST /api/ventures/:ventureId/traction
 * @route   PUT /api/ventures/:ventureId/traction
 * @access  Private (Owner only)
 */
const saveTraction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const existingTraction = req.venture.traction || {};

    const peopleContacted =
      req.body.peopleContacted !== undefined
        ? Number(req.body.peopleContacted)
        : existingTraction.peopleContacted || 0;
    const customerInterviews =
      req.body.customerInterviews !== undefined
        ? Number(req.body.customerInterviews)
        : existingTraction.customerInterviews || 0;
    const waitlistSignups =
      req.body.waitlistSignups !== undefined
        ? Number(req.body.waitlistSignups)
        : existingTraction.waitlistSignups || 0;
    const mvpUsers =
      req.body.mvpUsers !== undefined
        ? Number(req.body.mvpUsers)
        : existingTraction.mvpUsers || 0;
    const activeUsers =
      req.body.activeUsers !== undefined
        ? Number(req.body.activeUsers)
        : existingTraction.activeUsers || 0;
    const payingUsers =
      req.body.payingUsers !== undefined
        ? Number(req.body.payingUsers)
        : existingTraction.payingUsers || 0;
    const monthlyRevenue =
      req.body.monthlyRevenue !== undefined
        ? Number(req.body.monthlyRevenue)
        : existingTraction.monthlyRevenue || 0;

    // Calculate automated metrics (ignoring any manual metrics sent by frontend)
    const computedMetrics = calculateTractionMetrics({
      peopleContacted,
      mvpUsers,
      payingUsers,
      monthlyRevenue,
    });

    const historyArray = Array.isArray(existingTraction.history)
      ? [...existingTraction.history]
      : [];

    // Append new historical snapshot for charts
    const newHistoryEntry = {
      date: new Date(),
      peopleContacted,
      customerInterviews,
      waitlistSignups,
      mvpUsers,
      activeUsers,
      payingUsers,
      monthlyRevenue,
      currentTractionStage: computedMetrics.currentTractionStage,
    };
    historyArray.push(newHistoryEntry);

    req.venture.traction = {
      peopleContacted,
      customerInterviews,
      waitlistSignups,
      mvpUsers,
      activeUsers,
      payingUsers,
      monthlyRevenue,
      metrics: computedMetrics,
      history: historyArray,
      isSaved: true,
      createdAt: existingTraction.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Update progress tracking
    const completedSteps = new Set(
      req.venture.ideaValidation?.progress?.completedSteps || []
    );
    completedSteps.add('Traction Dashboard');
    req.venture.ideaValidation.progress.completedSteps = Array.from(completedSteps);
    req.venture.ideaValidation.progress.currentStep = 'Traction Dashboard';

    await req.venture.save();

    res.status(200).json({
      success: true,
      traction: formatTractionResponse(req.venture.traction),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Traction History array
 * @route   GET /api/ventures/:ventureId/traction/history
 * @access  Private (Owner only)
 */
const getTractionHistory = async (req, res, next) => {
  try {
    const history = req.venture.traction?.history || [];
    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTraction,
  saveTraction,
  getTractionHistory,
};
