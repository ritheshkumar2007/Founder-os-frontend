const { validationResult } = require('express-validator');

/**
 * Generate default Build Roadmap milestones
 */
const generateDefaultRoadmap = (venture) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const building = brief.building || 'MVP';

  const defaultMilestones = [
    {
      title: 'Problem & Brief Definition',
      status: 'COMPLETED',
      targetDate: new Date(),
      tasks: ['Define target customer', 'Identify core pain point', 'Document current workaround'],
    },
    {
      title: 'Customer Validation',
      status: brief.building ? 'COMPLETED' : 'IN_PROGRESS',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tasks: ['Conduct 5 customer interviews', 'Analyze pain level', 'Confirm willingness to pay'],
    },
    {
      title: `Build ${building} Core Scope`,
      status: 'IN_PROGRESS',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tasks: ['Implement core workflow', 'Setup authentication & database', 'Deploy initial build'],
    },
    {
      title: 'Beta Launch & User Feedback',
      status: 'PLANNED',
      targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      tasks: ['Onboard 5 early users', 'Collect feedback & log UX friction', 'Fix core bugs'],
    },
    {
      title: 'Public Launch',
      status: 'PLANNED',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tasks: ['Post in founder communities', 'Launch outreach campaign', 'Track conversion rates'],
    },
  ];

  return {
    currentMilestone: `Build ${building} Core Scope`,
    milestones: defaultMilestones,
    isSaved: true,
  };
};

/**
 * @desc    Get Build Roadmap
 * @route   GET /api/ventures/:ventureId/roadmap
 * @access  Private (Owner only)
 */
const getRoadmap = async (req, res, next) => {
  try {
    let roadmap = req.venture.roadmap;

    if (!roadmap || !roadmap.isSaved || !roadmap.milestones || roadmap.milestones.length === 0) {
      const generated = generateDefaultRoadmap(req.venture);
      req.venture.roadmap = {
        ...generated,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await req.venture.save();
      roadmap = req.venture.roadmap;
    }

    res.status(200).json({
      success: true,
      roadmap: {
        currentMilestone: roadmap.currentMilestone || 'MVP Build',
        milestones: roadmap.milestones || [],
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update Build Roadmap
 * @route   POST /api/ventures/:ventureId/roadmap
 * @route   PUT /api/ventures/:ventureId/roadmap
 * @access  Private (Owner only)
 */
const saveRoadmap = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { currentMilestone, milestones } = req.body;
    const existing = req.venture.roadmap || {};

    req.venture.roadmap = {
      currentMilestone: currentMilestone !== undefined ? currentMilestone : existing.currentMilestone || 'MVP Build',
      milestones: Array.isArray(milestones) ? milestones : existing.milestones || [],
      isSaved: true,
      createdAt: existing.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Update progress tracking
    const completedSteps = new Set(
      req.venture.ideaValidation?.progress?.completedSteps || []
    );
    completedSteps.add('Build Roadmap');
    req.venture.ideaValidation.progress.completedSteps = Array.from(completedSteps);
    req.venture.ideaValidation.progress.currentStep = 'Build Roadmap';

    await req.venture.save();

    res.status(200).json({
      success: true,
      roadmap: {
        currentMilestone: req.venture.roadmap.currentMilestone,
        milestones: req.venture.roadmap.milestones,
        createdAt: req.venture.roadmap.createdAt,
        updatedAt: req.venture.roadmap.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoadmap,
  saveRoadmap,
};
