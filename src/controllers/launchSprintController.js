const LaunchSprint = require('../models/LaunchSprint');
const Venture = require('../models/Venture');
const { generateLaunchSprintFromGemini } = require('../services/launchSprintGeminiService');

/**
 * Controller to handle POST /api/launch-sprint/generate
 */
async function generateSprint(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, ventureName, idea, mvpScope, marketingPlan, launchDate, launchGoal, targetAudience } = req.body;

    let venture = null;
    if (ventureId) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    // Auto-fill from Venture memory if fields missing
    if (venture) {
      ventureId = venture._id;
      ventureName = ventureName || venture.ventureName || venture.name || 'Untitled Venture';
      idea = idea || venture.brief?.building || 'New Startup Idea';
      mvpScope = mvpScope || venture.mvp?.job || '2-week core MVP scope';
      marketingPlan = marketingPlan || 'LinkedIn outreach & Product Hunt launch';
      launchDate = launchDate || '7 days from today';
      launchGoal = launchGoal || 'Acquire first 100 active users';
      targetAudience = targetAudience || venture.brief?.audience || 'Early adopters';
    } else {
      ventureName = ventureName || 'Untitled Venture';
      idea = idea || 'New Startup Idea';
      mvpScope = mvpScope || '2-week core MVP scope';
      marketingPlan = marketingPlan || 'LinkedIn outreach & Product Hunt launch';
      launchDate = launchDate || '7 days from today';
      launchGoal = launchGoal || 'Acquire first 100 active users';
      targetAudience = targetAudience || 'Early adopters';
    }

    // Call Gemini Launch Service
    const sprintPlan = await generateLaunchSprintFromGemini({
      ventureName,
      idea,
      mvpScope,
      marketingPlan,
      launchDate,
      launchGoal,
      targetAudience,
    });

    // Save to MongoDB
    const newSprint = await LaunchSprint.create({
      userId,
      ventureId: ventureId || undefined,
      ventureName,
      launchDetails: {
        launchDate,
        launchGoal,
        targetAudience,
      },
      sprintPlan,
    });

    return res.status(201).json({
      success: true,
      message: 'Launch Sprint generated successfully',
      launchSprint: newSprint,
    });
  } catch (error) {
    console.error('Error in launchSprintController generateSprint:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/launch-sprint/:ventureId
 */
async function getSprintHistory(req, res, next) {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;

    let sprints = [];
    if (ventureId && ventureId !== 'latest') {
      sprints = await LaunchSprint.find({ ventureId, userId }).sort({ createdAt: -1 });
    } else {
      sprints = await LaunchSprint.find({ userId }).sort({ createdAt: -1 });
    }

    const latest = sprints[0] || null;

    return res.status(200).json({
      success: true,
      launchSprint: latest,
      history: sprints,
    });
  } catch (error) {
    console.error('Error in launchSprintController getSprintHistory:', error);
    next(error);
  }
}

module.exports = {
  generateSprint,
  getSprintHistory,
};
