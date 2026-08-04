const { validationResult } = require('express-validator');

/**
 * Generate auto-prefill suggestions for MVP Scope based on Venture Brief & Insights
 */
const generateMvpSuggestions = (venture) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const insights = venture.ideaValidation?.validationInsights || {};

  const targetCustomer = brief.targetCustomer || '[target customer]';
  const problem = brief.problem || '[problem]';
  const currentWorkaround = brief.currentWorkaround || '[current workaround]';
  const desiredOutcome = brief.desiredOutcome || brief.building || '[desired outcome]';

  // 1. Core Customer Problem
  const coreCustomerProblem = brief.problem || brief.generatedSummary?.problemStatement || '';

  // 2. Main Customer Job (Target Customer + Problem + Desired Outcome)
  const mainCustomerJob = brief.targetCustomer && brief.problem
    ? `Help ${targetCustomer} resolve ${problem} to achieve ${desiredOutcome}.`
    : '';

  // 3. MVP Promise (Exact format requested)
  // "Help [target customer] achieve [desired outcome] without [current workaround]."
  const mvpPromise = `Help ${targetCustomer} achieve ${desiredOutcome} without ${currentWorkaround}.`;

  // 4. Desired Outcome
  const reuseDesiredOutcome = brief.desiredOutcome || '';

  // 5. Must Have Features (3-5 features based strictly on problem & validation evidence)
  const mustHaveFeatures = [
    `Core Workflow: Direct resolution engine for ${problem}`,
    `Simple Onboarding: Fast setup tailored for ${targetCustomer}`,
    `Outcome Delivery: Instant output matching ${desiredOutcome}`,
    `Feedback Tracker: Capture customer validation responses`,
  ];

  // Include specific validation quotes/evidence if available
  if (insights.quotes && insights.quotes.length > 0) {
    mustHaveFeatures.push(`Evidence-based feature addressing: "${insights.quotes[0]}"`);
  }

  // 6. Excluded Features (Features to intentionally delay)
  const excludedFeatures = [
    'Analytics & Reporting',
    'Team collaboration & multi-user access',
    'Admin dashboard',
    'Push & email notifications',
    'Advanced AI automation & custom integrations',
  ];

  // 7. Build Target
  const buildTarget = 'Build a usable MVP in two weeks.';

  // 8. Build Now / Build Later
  const buildNow = [...mustHaveFeatures];
  const buildLater = [...excludedFeatures];

  return {
    coreCustomerProblem,
    mainCustomerJob,
    mvpPromise,
    desiredOutcome: reuseDesiredOutcome,
    mustHaveFeatures,
    excludedFeatures,
    buildTarget,
    buildNow,
    buildLater,
    isSaved: false,
  };
};

/**
 * @desc    Get MVP Scope (returns saved data if exists, otherwise returns generated suggestions)
 * @route   GET /api/ventures/:ventureId/mvp-scope
 * @access  Private (Owner only)
 */
const getMvpScope = async (req, res, next) => {
  try {
    const mvpScope = req.venture.mvpScope;

    // Return saved data if previously saved by user
    if (mvpScope && mvpScope.isSaved) {
      return res.status(200).json({
        success: true,
        mvpScope: {
          coreCustomerProblem: mvpScope.coreCustomerProblem || '',
          mainCustomerJob: mvpScope.mainCustomerJob || '',
          mvpPromise: mvpScope.mvpPromise || '',
          desiredOutcome: mvpScope.desiredOutcome || '',
          mustHaveFeatures: mvpScope.mustHaveFeatures || [],
          excludedFeatures: mvpScope.excludedFeatures || [],
          buildTarget: mvpScope.buildTarget || 'Build a usable MVP in two weeks.',
          buildNow: mvpScope.buildNow || [],
          buildLater: mvpScope.buildLater || [],
          createdAt: mvpScope.createdAt,
          updatedAt: mvpScope.updatedAt,
        },
      });
    }

    // Otherwise generate suggestions from Idea Validation
    const suggestions = generateMvpSuggestions(req.venture);

    res.status(200).json({
      success: true,
      mvpScope: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update MVP Scope
 * @route   POST /api/ventures/:ventureId/mvp-scope
 * @route   PUT /api/ventures/:ventureId/mvp-scope
 * @access  Private (Owner only)
 */
const saveMvpScope = async (req, res, next) => {
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
      coreCustomerProblem,
      mainCustomerJob,
      mvpPromise,
      desiredOutcome,
      mustHaveFeatures,
      excludedFeatures,
      buildTarget,
      buildNow,
      buildLater,
    } = req.body;

    const existingScope = req.venture.mvpScope || {};

    req.venture.mvpScope = {
      coreCustomerProblem:
        coreCustomerProblem !== undefined ? coreCustomerProblem : existingScope.coreCustomerProblem || '',
      mainCustomerJob:
        mainCustomerJob !== undefined ? mainCustomerJob : existingScope.mainCustomerJob || '',
      mvpPromise:
        mvpPromise !== undefined ? mvpPromise : existingScope.mvpPromise || '',
      desiredOutcome:
        desiredOutcome !== undefined ? desiredOutcome : existingScope.desiredOutcome || '',
      mustHaveFeatures:
        Array.isArray(mustHaveFeatures) ? mustHaveFeatures : existingScope.mustHaveFeatures || [],
      excludedFeatures:
        Array.isArray(excludedFeatures) ? excludedFeatures : existingScope.excludedFeatures || [],
      buildTarget:
        buildTarget !== undefined ? buildTarget : existingScope.buildTarget || 'Build a usable MVP in two weeks.',
      buildNow:
        Array.isArray(buildNow) ? buildNow : existingScope.buildNow || [],
      buildLater:
        Array.isArray(buildLater) ? buildLater : existingScope.buildLater || [],
      isSaved: true,
      createdAt: existingScope.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Update progress tracking: add "MVP Scope" to completedSteps
    const completedSteps = new Set(
      req.venture.ideaValidation?.progress?.completedSteps || []
    );
    completedSteps.add('MVP Scope');
    req.venture.ideaValidation.progress.completedSteps = Array.from(completedSteps);
    req.venture.ideaValidation.progress.currentStep = 'MVP Scope';
    req.venture.ideaValidation.progress.unlockedStep = 'MVP Scope';

    await req.venture.save();

    res.status(200).json({
      success: true,
      mvpScope: {
        coreCustomerProblem: req.venture.mvpScope.coreCustomerProblem,
        mainCustomerJob: req.venture.mvpScope.mainCustomerJob,
        mvpPromise: req.venture.mvpScope.mvpPromise,
        desiredOutcome: req.venture.mvpScope.desiredOutcome,
        mustHaveFeatures: req.venture.mvpScope.mustHaveFeatures,
        excludedFeatures: req.venture.mvpScope.excludedFeatures,
        buildTarget: req.venture.mvpScope.buildTarget,
        buildNow: req.venture.mvpScope.buildNow,
        buildLater: req.venture.mvpScope.buildLater,
        createdAt: req.venture.mvpScope.createdAt,
        updatedAt: req.venture.mvpScope.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMvpScope,
  saveMvpScope,
};
