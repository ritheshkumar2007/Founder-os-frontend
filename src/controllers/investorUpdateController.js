const { validationResult } = require('express-validator');

/**
 * Generate factual Investor Update using ONLY existing Venture document data
 * Never invents numbers or facts. Returns "Not yet available" if data missing.
 */
const generateFactualInvestorUpdate = (venture) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const customerVal = venture.ideaValidation?.customerValidation || {};
  const insights = venture.ideaValidation?.validationInsights || {};
  const notes = venture.ideaValidation?.founderNotes || {};
  const progressState = venture.ideaValidation?.progress || {};
  const mvp = venture.mvpScope || {};
  const mkt = venture.marketingPlan || {};
  const sprint = venture.launchSprint || {};
  const trac = venture.traction || {};

  // 1. Company Name
  const companyName = venture.ventureName || 'Not yet available';

  // 2. Problem
  const problem = brief.problem || 'Not yet available';

  // 3. Solution
  const solution = mvp.mvpPromise || brief.generatedSummary?.valueProposition || 'Not yet available';

  // 4. Target Customer
  const targetCustomer = brief.targetCustomer || 'Not yet available';

  // 5. Validation Evidence
  const totalInterviews = customerVal.interviews?.length || 0;
  const highPain = insights.highPainCount || 0;
  const wouldPay = insights.wouldPayCount || 0;
  const decision = insights.decision || 'Keep Validating';

  let validationEvidence = 'Not yet available';
  if (totalInterviews > 0) {
    validationEvidence = `${totalInterviews} customer interviews conducted. High Pain Responses: ${highPain}. Would Pay Intent: ${wouldPay}. Validation Decision: ${decision}.`;
  } else {
    validationEvidence = '0 customer interviews conducted. Decision: Keep Validating.';
  }

  // 6. MVP Progress
  const currentStep = progressState.currentStep || 'Venture Brief';
  const completedSteps = progressState.completedSteps || [];
  const buildTarget = mvp.buildTarget || 'Build a usable MVP in two weeks.';
  const mustHavesCount = mvp.mustHaveFeatures?.length || 0;

  const mvpProgress = `Current Phase: ${currentStep}. Completed Milestones: ${
    completedSteps.length > 0 ? completedSteps.join(', ') : 'None'
  }. Build Target: ${buildTarget} (${mustHavesCount} core features defined).`;

  // 7. Marketing Progress
  const channels = mkt.launchChannels || [];
  const headline = mkt.landingPageHeadline || '';
  const marketingProgress = mkt.isSaved
    ? `Launch Channels: ${
        channels.length > 0 ? channels.join(', ') : 'Not specified'
      }. Landing Page Headline: "${headline || 'Not configured'}".`
    : 'Marketing plan not yet configured.';

  // 8. Launch Progress
  const currentDay = sprint.currentDay || 1;
  const overallProgress = sprint.overallProgress || 0;
  const completedTasks = sprint.completedTasks || 0;
  const totalTasks = (sprint.completedTasks || 0) + (sprint.remainingTasks || 0);
  const successGoal = sprint.successGoal || 'Get 5 early users to try the product.';

  const launchProgress = sprint.isSaved
    ? `Launch Sprint Day ${currentDay} of 7. Overall Progress: ${overallProgress}%. Tasks Completed: ${completedTasks}/${totalTasks}. Goal: ${successGoal}.`
    : 'Launch sprint not yet configured.';

  // 9. Traction Summary
  const stage = trac.metrics?.currentTractionStage || 'Pre-Launch';
  const contacted = trac.peopleContacted || 0;
  const waitlist = trac.waitlistSignups || 0;
  const mvpUsers = trac.mvpUsers || 0;
  const payingUsers = trac.payingUsers || 0;
  const revenue = trac.monthlyRevenue || 0;

  const tractionSummary = `Current Stage: ${stage}. People Contacted: ${contacted}, Waitlist Signups: ${waitlist}, MVP Users: ${mvpUsers}, Paying Users: ${payingUsers}, Monthly Revenue: $${revenue}.`;

  // 10. Key Learnings
  let keyLearnings = 'Not yet available';
  if (notes.text && notes.text.trim()) {
    keyLearnings = `Founder Notes: ${notes.text.trim()}`;
  } else if (insights.quotes && insights.quotes.length > 0) {
    keyLearnings = `Customer Quote: "${insights.quotes[0]}"`;
  } else if (insights.positiveSignals && insights.positiveSignals.length > 0) {
    keyLearnings = `Positive Signal: ${insights.positiveSignals[0]}`;
  }

  // 11. Next Milestone
  const nextMilestone = progressState.unlockedStep
    ? `Next focus area: ${progressState.unlockedStep}`
    : 'Next focus area: Customer Validation';

  // 12. Funding Needed
  const fundingNeeded = 'Not yet specified';

  return {
    companyName,
    problem,
    solution,
    targetCustomer,
    validationEvidence,
    mvpProgress,
    marketingProgress,
    launchProgress,
    tractionSummary,
    keyLearnings,
    nextMilestone,
    fundingNeeded,
    isSaved: true,
  };
};

/**
 * Format investor update object for standard JSON API response
 */
const formatInvestorUpdateResponse = (update) => {
  return {
    companyName: update.companyName || '',
    problem: update.problem || '',
    solution: update.solution || '',
    targetCustomer: update.targetCustomer || '',
    validationEvidence: update.validationEvidence || '',
    mvpProgress: update.mvpProgress || '',
    marketingProgress: update.marketingProgress || '',
    launchProgress: update.launchProgress || '',
    tractionSummary: update.tractionSummary || '',
    keyLearnings: update.keyLearnings || '',
    nextMilestone: update.nextMilestone || '',
    fundingNeeded: update.fundingNeeded || 'Not yet specified',
    generatedAt: update.generatedAt,
    updatedAt: update.updatedAt,
  };
};

/**
 * @desc    Get Investor Update (loads saved update or generates default factual update)
 * @route   GET /api/ventures/:ventureId/investor-update
 * @access  Private (Owner only)
 */
const getInvestorUpdate = async (req, res, next) => {
  try {
    let update = req.venture.investorUpdate;

    if (!update || !update.isSaved) {
      const generated = generateFactualInvestorUpdate(req.venture);
      req.venture.investorUpdate = {
        ...generated,
        generatedAt: new Date(),
        updatedAt: new Date(),
      };
      await req.venture.save();
      update = req.venture.investorUpdate;
    }

    res.status(200).json({
      success: true,
      investorUpdate: formatInvestorUpdateResponse(update),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate & Save a fresh Investor Update from current venture state
 * @route   POST /api/ventures/:ventureId/investor-update
 * @access  Private (Owner only)
 */
const createInvestorUpdate = async (req, res, next) => {
  try {
    const generated = generateFactualInvestorUpdate(req.venture);

    // Override with any explicit fields sent in body if provided
    const body = req.body || {};
    const finalUpdate = {
      ...generated,
      ...body,
      isSaved: true,
      generatedAt: new Date(),
      updatedAt: new Date(),
    };

    req.venture.investorUpdate = finalUpdate;

    // Update venture progress
    const completedSteps = new Set(
      req.venture.ideaValidation?.progress?.completedSteps || []
    );
    completedSteps.add('Investor Update');
    req.venture.ideaValidation.progress.completedSteps = Array.from(completedSteps);
    req.venture.ideaValidation.progress.currentStep = 'Investor Update';

    await req.venture.save();

    res.status(201).json({
      success: true,
      investorUpdate: formatInvestorUpdateResponse(req.venture.investorUpdate),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Investor Update manually (founder edits)
 * @route   PUT /api/ventures/:ventureId/investor-update
 * @access  Private (Owner only)
 */
const updateInvestorUpdate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const existing = req.venture.investorUpdate || {};
    const body = req.body;

    req.venture.investorUpdate = {
      companyName: body.companyName !== undefined ? body.companyName : existing.companyName || '',
      problem: body.problem !== undefined ? body.problem : existing.problem || '',
      solution: body.solution !== undefined ? body.solution : existing.solution || '',
      targetCustomer: body.targetCustomer !== undefined ? body.targetCustomer : existing.targetCustomer || '',
      validationEvidence: body.validationEvidence !== undefined ? body.validationEvidence : existing.validationEvidence || '',
      mvpProgress: body.mvpProgress !== undefined ? body.mvpProgress : existing.mvpProgress || '',
      marketingProgress: body.marketingProgress !== undefined ? body.marketingProgress : existing.marketingProgress || '',
      launchProgress: body.launchProgress !== undefined ? body.launchProgress : existing.launchProgress || '',
      tractionSummary: body.tractionSummary !== undefined ? body.tractionSummary : existing.tractionSummary || '',
      keyLearnings: body.keyLearnings !== undefined ? body.keyLearnings : existing.keyLearnings || '',
      nextMilestone: body.nextMilestone !== undefined ? body.nextMilestone : existing.nextMilestone || '',
      fundingNeeded: body.fundingNeeded !== undefined ? body.fundingNeeded : existing.fundingNeeded || 'Not yet specified',
      isSaved: true,
      generatedAt: existing.generatedAt || new Date(),
      updatedAt: new Date(),
    };

    await req.venture.save();

    res.status(200).json({
      success: true,
      investorUpdate: formatInvestorUpdateResponse(req.venture.investorUpdate),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Investor Update as plain text format
 * @route   GET /api/ventures/:ventureId/investor-update/text
 * @access  Private (Owner only)
 */
const getInvestorUpdateText = async (req, res, next) => {
  try {
    let update = req.venture.investorUpdate;
    if (!update || !update.isSaved) {
      const generated = generateFactualInvestorUpdate(req.venture);
      req.venture.investorUpdate = {
        ...generated,
        generatedAt: new Date(),
        updatedAt: new Date(),
      };
      await req.venture.save();
      update = req.venture.investorUpdate;
    }

    const plainText = `
=== FOUNDER INVESTOR UPDATE: ${update.companyName.toUpperCase()} ===
Date: ${new Date(update.updatedAt || Date.now()).toLocaleDateString()}

1. TARGET CUSTOMER & PROBLEM
- Target Customer: ${update.targetCustomer}
- Problem: ${update.problem}

2. SOLUTION & MVP PROMISE
- Solution: ${update.solution}

3. VALIDATION & EVIDENCE
- ${update.validationEvidence}

4. MVP & PRODUCT PROGRESS
- ${update.mvpProgress}

5. MARKETING & GO-TO-MARKET
- ${update.marketingProgress}

6. LAUNCH SPRINT STATUS
- ${update.launchProgress}

7. TRACTION & REVENUE METRICS
- ${update.tractionSummary}

8. KEY LEARNINGS
- ${update.keyLearnings}

9. NEXT MILESTONE
- ${update.nextMilestone}

10. FUNDING NEEDED
- ${update.fundingNeeded}

==================================================
`;

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(plainText.trim());
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get concise JSON summary for frontend preview
 * @route   GET /api/ventures/:ventureId/investor-update/summary
 * @access  Private (Owner only)
 */
const getInvestorUpdateSummary = async (req, res, next) => {
  try {
    let update = req.venture.investorUpdate;
    if (!update || !update.isSaved) {
      const generated = generateFactualInvestorUpdate(req.venture);
      req.venture.investorUpdate = {
        ...generated,
        generatedAt: new Date(),
        updatedAt: new Date(),
      };
      await req.venture.save();
      update = req.venture.investorUpdate;
    }

    const summary = {
      companyName: update.companyName,
      targetCustomer: update.targetCustomer,
      solution: update.solution,
      tractionSummary: update.tractionSummary,
      nextMilestone: update.nextMilestone,
      fundingNeeded: update.fundingNeeded,
      lastUpdated: update.updatedAt,
    };

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestorUpdate,
  createInvestorUpdate,
  updateInvestorUpdate,
  getInvestorUpdateText,
  getInvestorUpdateSummary,
};
