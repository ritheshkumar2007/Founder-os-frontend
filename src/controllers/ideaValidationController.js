const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

/**
 * Helper to update progress state dynamically on a Venture document
 */
const syncVentureProgress = (venture) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const interviews = venture.ideaValidation?.customerValidation?.interviews || [];
  const insights = venture.ideaValidation?.validationInsights || {};

  const completed = new Set(venture.ideaValidation?.progress?.completedSteps || []);

  let unlockedStep = 'Venture Brief';
  let currentStep = 'Venture Brief';

  // Check Venture Brief completeness
  const isBriefComplete = Boolean(
    brief.building && brief.targetCustomer && brief.problem
  );
  if (isBriefComplete) {
    completed.add('Venture Brief');
    unlockedStep = 'Customer Validation';
    currentStep = 'Customer Validation';
  }

  // Check Customer Validation completeness
  const isValidationComplete = interviews.length >= 1;
  if (isValidationComplete) {
    unlockedStep = 'Validation Insights';
    currentStep = 'Customer Validation';
    if (interviews.length >= 3) {
      completed.add('Customer Validation');
    }
  }

  // Check Validation Insights completeness
  if (insights.lastAnalyzedAt || insights.totalInterviews > 0) {
    completed.add('Validation Insights');
    currentStep = 'Validation Insights';
    unlockedStep = 'Validation Insights';
  }

  venture.ideaValidation.progress = {
    currentStep,
    unlockedStep,
    completedSteps: Array.from(completed),
  };
};

// ====================================================
// 1. VENTURE BRIEF CONTROLLERS
// ====================================================

/**
 * @desc    Save/Update Venture Brief & generate summary
 * @route   POST /api/ventures/:ventureId/idea-validation/venture-brief
 * @route   PUT /api/ventures/:ventureId/idea-validation/venture-brief
 * @access  Private (Owner only)
 */
const saveVentureBrief = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const {
      ventureName,
      building,
      targetCustomer,
      problem,
      currentWorkaround,
      desiredOutcome,
    } = req.body;

    // Update venture name if provided
    if (ventureName) {
      req.venture.ventureName = ventureName;
    }

    const brief = req.venture.ideaValidation.ventureBrief || {};
    if (building !== undefined) brief.building = building;
    if (targetCustomer !== undefined) brief.targetCustomer = targetCustomer;
    if (problem !== undefined) brief.problem = problem;
    if (currentWorkaround !== undefined) brief.currentWorkaround = currentWorkaround;
    if (desiredOutcome !== undefined) brief.desiredOutcome = desiredOutcome;

    // Generate summary string as specified:
    // "We believe [target customer] experiences [problem] often enough that they will change from [current workaround]."
    const tc = brief.targetCustomer || '[target customer]';
    const pr = brief.problem || '[problem]';
    const cw = brief.currentWorkaround || '[current workaround]';

    brief.generatedSummary = {
      targetCustomer: brief.targetCustomer || '',
      problemStatement: brief.problem || '',
      currentWorkaround: brief.currentWorkaround || '',
      valueProposition: `We believe ${tc} experiences ${pr} often enough that they will change from ${cw}.`,
      riskiestAssumption: `Target customer (${tc}) experiences ${pr} severely enough to pay for a solution rather than using ${cw}.`,
    };

    req.venture.ideaValidation.ventureBrief = brief;
    syncVentureProgress(req.venture);

    await req.venture.save();

    res.status(200).json({
      success: true,
      ventureBrief: req.venture.ideaValidation.ventureBrief,
      generatedSummary: req.venture.ideaValidation.ventureBrief.generatedSummary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Venture Brief
 * @route   GET /api/ventures/:ventureId/idea-validation/venture-brief
 * @access  Private (Owner only)
 */
const getVentureBrief = async (req, res, next) => {
  try {
    const brief = req.venture.ideaValidation.ventureBrief || {};
    res.status(200).json({
      success: true,
      ventureBrief: brief,
      generatedSummary: brief.generatedSummary || {},
    });
  } catch (error) {
    next(error);
  }
};

// ====================================================
// 2. CUSTOMER VALIDATION (INTERVIEWS) CONTROLLERS
// ====================================================

/**
 * @desc    Create interview subdocument
 * @route   POST /api/ventures/:ventureId/interviews
 * @access  Private (Owner only)
 */
const createInterview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { personName, role, quote, painLevel, wouldPay } = req.body;

    const newInterview = {
      personName,
      role: role || '',
      quote: quote || '',
      painLevel,
      wouldPay,
      createdAt: new Date(),
    };

    req.venture.ideaValidation.customerValidation.interviews.push(newInterview);
    syncVentureProgress(req.venture);

    await req.venture.save();

    const createdInterview =
      req.venture.ideaValidation.customerValidation.interviews[
        req.venture.ideaValidation.customerValidation.interviews.length - 1
      ];

    res.status(201).json({
      success: true,
      interview: createdInterview,
      interviews: req.venture.ideaValidation.customerValidation.interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all interviews for venture
 * @route   GET /api/ventures/:ventureId/interviews
 * @access  Private (Owner only)
 */
const getInterviews = async (req, res, next) => {
  try {
    const interviews =
      req.venture.ideaValidation.customerValidation.interviews || [];
    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an interview
 * @route   PUT /api/ventures/:ventureId/interviews/:interviewId
 * @access  Private (Owner only)
 */
const updateInterview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { interviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Interview ID format',
      });
    }

    const interview =
      req.venture.ideaValidation.customerValidation.interviews.id(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    const { personName, role, quote, painLevel, wouldPay } = req.body;
    if (personName !== undefined) interview.personName = personName;
    if (role !== undefined) interview.role = role;
    if (quote !== undefined) interview.quote = quote;
    if (painLevel !== undefined) interview.painLevel = painLevel;
    if (wouldPay !== undefined) interview.wouldPay = wouldPay;

    syncVentureProgress(req.venture);
    await req.venture.save();

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an interview
 * @route   DELETE /api/ventures/:ventureId/interviews/:interviewId
 * @access  Private (Owner only)
 */
const deleteInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Interview ID format',
      });
    }

    const interview =
      req.venture.ideaValidation.customerValidation.interviews.id(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    req.venture.ideaValidation.customerValidation.interviews.pull(interviewId);
    syncVentureProgress(req.venture);
    await req.venture.save();

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully',
      count: req.venture.ideaValidation.customerValidation.interviews.length,
    });
  } catch (error) {
    next(error);
  }
};

// ====================================================
// 3. VALIDATION INSIGHTS CONTROLLER
// ====================================================

/**
 * @desc    Analyze interviews and compute validation insights
 * @route   POST /api/ventures/:ventureId/analyze
 * @access  Private (Owner only)
 */
const analyzeInterviews = async (req, res, next) => {
  try {
    const interviews =
      req.venture.ideaValidation.customerValidation.interviews || [];

    const totalInterviews = interviews.length;
    const highPainCount = interviews.filter((i) => i.painLevel === 'HIGH').length;
    const lowPainCount = interviews.filter((i) => i.painLevel === 'LOW').length;
    const wouldPayCount = interviews.filter((i) => i.wouldPay === 'YES').length;

    // Collect quotes from saved interviews ONLY
    const quotes = interviews
      .map((i) => i.quote)
      .filter((q) => q && q.trim().length > 0);

    // Repeated pain points derived strictly from quotes & roles
    const painPointsSet = new Set();
    interviews.forEach((i) => {
      if (i.quote) painPointsSet.add(i.quote);
    });
    const repeatedPainPoints = Array.from(painPointsSet);

    // Warning signs
    const warningSigns = interviews
      .filter((i) => i.painLevel === 'LOW' || i.wouldPay === 'NO')
      .map(
        (i) =>
          `${i.personName} (${i.role || 'User'}): Low pain level or unwilling to pay. Quote: "${i.quote || 'N/A'}"`
      );

    // Positive signals
    const positiveSignals = interviews
      .filter(
        (i) =>
          i.painLevel === 'HIGH' && (i.wouldPay === 'YES' || i.wouldPay === 'MAYBE')
      )
      .map(
        (i) =>
          `${i.personName} (${i.role || 'User'}): High pain level and willing to pay (${i.wouldPay}). Quote: "${i.quote || 'N/A'}"`
      );

    // Decision Logic per strict rules:
    // If interviews < 3 -> Keep Validating
    // Else if highPain >= 3 -> Promising Signal
    // Else if majority pain LOW -> Revisit Customer Problem
    // Else -> Keep Validating
    let decision = 'Keep Validating';
    if (totalInterviews < 3) {
      decision = 'Keep Validating';
    } else if (highPainCount >= 3) {
      decision = 'Promising Signal';
    } else if (lowPainCount > totalInterviews / 2) {
      decision = 'Revisit Customer Problem';
    } else {
      decision = 'Keep Validating';
    }

    const insights = {
      totalInterviews,
      highPainCount,
      wouldPayCount,
      repeatedPainPoints,
      quotes,
      warningSigns,
      positiveSignals,
      decision,
      lastAnalyzedAt: new Date(),
    };

    req.venture.ideaValidation.validationInsights = insights;
    syncVentureProgress(req.venture);

    await req.venture.save();

    res.status(200).json({
      success: true,
      validationInsights: insights,
    });
  } catch (error) {
    next(error);
  }
};

// ====================================================
// 4. FOUNDER NOTES CONTROLLERS
// ====================================================

/**
 * @desc    Get founder notes
 * @route   GET /api/ventures/:ventureId/founder-notes
 * @access  Private (Owner only)
 */
const getFounderNotes = async (req, res, next) => {
  try {
    const founderNotes = req.venture.ideaValidation.founderNotes || {
      text: '',
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      founderNotes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update founder notes (supports auto-save)
 * @route   PUT /api/ventures/:ventureId/founder-notes
 * @access  Private (Owner only)
 */
const saveFounderNotes = async (req, res, next) => {
  try {
    const { text } = req.body;

    req.venture.ideaValidation.founderNotes = {
      text: text !== undefined ? text : req.venture.ideaValidation.founderNotes?.text || '',
      updatedAt: new Date(),
    };

    await req.venture.save();

    res.status(200).json({
      success: true,
      founderNotes: req.venture.ideaValidation.founderNotes,
    });
  } catch (error) {
    next(error);
  }
};

// ====================================================
// 5. PROGRESS CONTROLLER
// ====================================================

/**
 * @desc    Get venture progress status
 * @route   GET /api/ventures/:ventureId/progress
 * @access  Private (Owner only)
 */
const getProgress = async (req, res, next) => {
  try {
    syncVentureProgress(req.venture);
    await req.venture.save();

    res.status(200).json({
      success: true,
      progress: req.venture.ideaValidation.progress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveVentureBrief,
  getVentureBrief,
  createInterview,
  getInterviews,
  updateInterview,
  deleteInterview,
  analyzeInterviews,
  getFounderNotes,
  saveFounderNotes,
  getProgress,
};
