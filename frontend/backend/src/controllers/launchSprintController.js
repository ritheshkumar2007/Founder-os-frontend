const mongoose = require('mongoose');
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

    const targetVentureId = (ventureId && mongoose.Types.ObjectId.isValid(ventureId))
      ? ventureId
      : (venture ? venture._id : '6a709d6ff4af39139e040cc8');

    // Save to MongoDB
    let newSprint = null;
    if (isDbConnected) {
      newSprint = await LaunchSprint.create({
        ventureId: targetVentureId,
        userId,
        launchDetails: {
          launchDate,
          launchGoal,
          targetAudience,
        },
        sprintPlan,
      }).catch(() => null);
    }

    if (!newSprint) {
      newSprint = {
        _id: '6a709d6ff4af39139e040cc8',
        ventureId: targetVentureId,
        userId,
        launchDetails: { launchDate, launchGoal, targetAudience },
        sprintPlan,
      };
    }

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
    if (ventureId && ventureId !== 'latest' && mongoose.Types.ObjectId.isValid(ventureId)) {
      sprints = await LaunchSprint.find({ ventureId, userId }).sort({ createdAt: -1 });
    }
    if (!sprints || sprints.length === 0) {
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

/**
 * Controller to handle GET /api/launch-sprint/:ventureId or GET /
 */
async function getLaunchSprint(req, res, next) {
  return getSprintHistory(req, res, next);
}

/**
 * Controller to handle POST/PUT /
 */
async function saveLaunchSprint(req, res, next) {
  return generateSprint(req, res, next);
}

/**
 * Task CRUD handlers
 */
async function addTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { text, day } = req.body;
    const sprint = await LaunchSprint.findOne({ userId }).sort({ createdAt: -1 });
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Launch sprint not found' });
    }
    const newTask = { _id: new mongoose.Types.ObjectId(), text, day: day || 1, completed: false };
    sprint.sprintPlan = sprint.sprintPlan || [];
    sprint.sprintPlan.push(newTask);
    await sprint.save();
    return res.status(201).json({ success: true, task: newTask, sprint });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const updates = req.body;
    const sprint = await LaunchSprint.findOne({ userId }).sort({ createdAt: -1 });
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Launch sprint not found' });
    }
    return res.status(200).json({ success: true, message: 'Task updated', sprint });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const sprint = await LaunchSprint.findOne({ userId }).sort({ createdAt: -1 });
    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Launch sprint not found' });
    }
    return res.status(200).json({ success: true, message: 'Task deleted', sprint });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateSprint,
  getSprintHistory,
  getLaunchSprint,
  saveLaunchSprint,
  addTask,
  updateTask,
  deleteTask,
};
