const { validationResult } = require('express-validator');

/**
 * Generate intelligent default Marketing Plan using existing Venture data
 */
const generateDefaultMarketingPlan = (venture) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const insights = venture.ideaValidation?.validationInsights || {};
  const mvp = venture.mvpScope || {};

  const targetCustomer = brief.targetCustomer || '[Target Customer]';
  const problem = brief.problem || '[Core Problem]';
  const currentWorkaround = brief.currentWorkaround || '[Current Workaround]';
  const desiredOutcome = brief.desiredOutcome || brief.building || '[Desired Outcome]';

  const valueProp = brief.generatedSummary?.valueProposition ||
    `We believe ${targetCustomer} experiences ${problem} often enough that they will change from ${currentWorkaround}.`;
  
  const promise = mvp.mvpPromise ||
    `Help ${targetCustomer} achieve ${desiredOutcome} without ${currentWorkaround}.`;

  const idealCustomerProfile = `Target Customer: ${targetCustomer}. Main Pain Point: ${problem}. Current Workaround: ${currentWorkaround}. Goal: ${desiredOutcome}.`;
  
  const positioningStatement = `For ${targetCustomer} struggling with ${problem}, our product enables ${desiredOutcome} without ${currentWorkaround}. Unlike alternative workarounds, we provide a streamlined, focused solution.`;

  const marketingMessage = `Stop struggling with ${currentWorkaround}. ${promise}`;

  const landingPageHeadline = `The Effortless Way for ${targetCustomer} to Achieve ${desiredOutcome}`;

  const callToAction = 'Get Early Access Now';

  const launchChannels = [
    'Direct LinkedIn & Twitter Founder Outreach',
    'Product Hunt Launch',
    'Niche Subreddits & Indie Hackers',
    'Founder & Operator Slack / Discord Communities',
    'Targeted Email Sequences',
  ];

  const directOutreachMessage = `Hi [Name],\n\nI noticed your work with ${targetCustomer} and wanted to reach out. Many founders mention that ${problem} is a constant headache when relying on ${currentWorkaround}.\n\nWe built a lightweight solution designed to ${promise}.\n\nWould you be open to trying it out for 5 minutes and sharing your feedback?`;

  const communityPostTemplate = `Hey everyone 👋\n\nAfter speaking with founders experiencing ${problem}, we built a tool to help ${targetCustomer} achieve ${desiredOutcome}.\n\nKey features built for speed:\n- Direct workflow tackling ${problem}\n- No complex setup or steep learning curve\n\nWould love for the community to try it and give raw feedback!`;

  const referralIdea = 'Give 1 month of free access for every colleague or founder friend who signs up using your invite link.';

  const contentIdeas = [
    `Why ${currentWorkaround} is costing ${targetCustomer} hours every week`,
    `5 actionable steps to achieve ${desiredOutcome} in 2026`,
    `Behind the scenes: How we solved ${problem} for early adopters`,
  ];

  // Include validation quotes if available
  if (insights.quotes && insights.quotes.length > 0) {
    contentIdeas.push(`What early testers say: "${insights.quotes[0]}"`);
  }

  const first100UsersStrategy = `1. Conduct 1-on-1 direct outreach to 50 targeted prospects on LinkedIn and Twitter.\n2. Post weekly value-driven breakdown posts in 3 active founder communities.\n3. Offer dedicated onboardings and direct feedback calls for early adopters.`;

  return {
    idealCustomerProfile,
    positioningStatement,
    marketingMessage,
    landingPageHeadline,
    callToAction,
    launchChannels,
    directOutreachMessage,
    communityPostTemplate,
    referralIdea,
    contentIdeas,
    first100UsersStrategy,
    isSaved: true,
  };
};

/**
 * @desc    Get Marketing Plan (generates & saves default if not existing)
 * @route   GET /api/ventures/:ventureId/marketing-plan
 * @access  Private (Owner only)
 */
const getMarketingPlan = async (req, res, next) => {
  try {
    let marketingPlan = req.venture.marketingPlan;

    // If plan is not saved, generate default plan and save to venture
    if (!marketingPlan || !marketingPlan.isSaved) {
      const generatedPlan = generateDefaultMarketingPlan(req.venture);
      req.venture.marketingPlan = {
        ...generatedPlan,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await req.venture.save();
      marketingPlan = req.venture.marketingPlan;
    }

    res.status(200).json({
      success: true,
      marketingPlan: {
        idealCustomerProfile: marketingPlan.idealCustomerProfile || '',
        positioningStatement: marketingPlan.positioningStatement || '',
        marketingMessage: marketingPlan.marketingMessage || '',
        landingPageHeadline: marketingPlan.landingPageHeadline || '',
        callToAction: marketingPlan.callToAction || '',
        launchChannels: marketingPlan.launchChannels || [],
        directOutreachMessage: marketingPlan.directOutreachMessage || '',
        communityPostTemplate: marketingPlan.communityPostTemplate || '',
        referralIdea: marketingPlan.referralIdea || '',
        contentIdeas: marketingPlan.contentIdeas || [],
        first100UsersStrategy: marketingPlan.first100UsersStrategy || '',
        createdAt: marketingPlan.createdAt,
        updatedAt: marketingPlan.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update Marketing Plan
 * @route   POST /api/ventures/:ventureId/marketing-plan
 * @route   PUT /api/ventures/:ventureId/marketing-plan
 * @access  Private (Owner only)
 */
const saveMarketingPlan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const existingPlan = req.venture.marketingPlan || {};
    const body = req.body;

    req.venture.marketingPlan = {
      idealCustomerProfile:
        body.idealCustomerProfile !== undefined
          ? body.idealCustomerProfile
          : existingPlan.idealCustomerProfile || '',
      positioningStatement:
        body.positioningStatement !== undefined
          ? body.positioningStatement
          : existingPlan.positioningStatement || '',
      marketingMessage:
        body.marketingMessage !== undefined
          ? body.marketingMessage
          : existingPlan.marketingMessage || '',
      landingPageHeadline:
        body.landingPageHeadline !== undefined
          ? body.landingPageHeadline
          : existingPlan.landingPageHeadline || '',
      callToAction:
        body.callToAction !== undefined
          ? body.callToAction
          : existingPlan.callToAction || '',
      launchChannels: Array.isArray(body.launchChannels)
        ? body.launchChannels
        : existingPlan.launchChannels || [],
      directOutreachMessage:
        body.directOutreachMessage !== undefined
          ? body.directOutreachMessage
          : existingPlan.directOutreachMessage || '',
      communityPostTemplate:
        body.communityPostTemplate !== undefined
          ? body.communityPostTemplate
          : existingPlan.communityPostTemplate || '',
      referralIdea:
        body.referralIdea !== undefined
          ? body.referralIdea
          : existingPlan.referralIdea || '',
      contentIdeas: Array.isArray(body.contentIdeas)
        ? body.contentIdeas
        : existingPlan.contentIdeas || [],
      first100UsersStrategy:
        body.first100UsersStrategy !== undefined
          ? body.first100UsersStrategy
          : existingPlan.first100UsersStrategy || '',
      isSaved: true,
      createdAt: existingPlan.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Update progress tracking
    const completedSteps = new Set(
      req.venture.ideaValidation?.progress?.completedSteps || []
    );
    completedSteps.add('Marketing Plan');
    req.venture.ideaValidation.progress.completedSteps = Array.from(completedSteps);
    req.venture.ideaValidation.progress.currentStep = 'Marketing Plan';

    await req.venture.save();

    res.status(200).json({
      success: true,
      marketingPlan: {
        idealCustomerProfile: req.venture.marketingPlan.idealCustomerProfile,
        positioningStatement: req.venture.marketingPlan.positioningStatement,
        marketingMessage: req.venture.marketingPlan.marketingMessage,
        landingPageHeadline: req.venture.marketingPlan.landingPageHeadline,
        callToAction: req.venture.marketingPlan.callToAction,
        launchChannels: req.venture.marketingPlan.launchChannels,
        directOutreachMessage: req.venture.marketingPlan.directOutreachMessage,
        communityPostTemplate: req.venture.marketingPlan.communityPostTemplate,
        referralIdea: req.venture.marketingPlan.referralIdea,
        contentIdeas: req.venture.marketingPlan.contentIdeas,
        first100UsersStrategy: req.venture.marketingPlan.first100UsersStrategy,
        createdAt: req.venture.marketingPlan.createdAt,
        updatedAt: req.venture.marketingPlan.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketingPlan,
  saveMarketingPlan,
};
