const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Venture = require('../models/Venture');
const { getTasksForVenture, updateTaskStatus } = require('../services/taskService');
const { getMilestonesForVenture } = require('../services/milestoneService');
const { getActiveSprint, updateSprintGoal } = require('../services/sprintService');
const { calculatePillarProgress } = require('../services/progressService');
const { getLatestWeeklyReview, generateWeeklyReview } = require('../services/reviewService');

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/execution/:ventureId/kanban
 * @desc    Get Kanban tasks grouped by status ('To Do', 'In Progress', 'Review', 'Done')
 * @access  Private
 */
router.get('/:ventureId/kanban', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const tasks = await getTasksForVenture(ventureId);
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/execution/tasks/:taskId/status
 * @desc    Update a task status column in Kanban
 * @access  Private
 */
router.patch('/tasks/:taskId/status', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const updatedTask = await updateTaskStatus(taskId, status);
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found or invalid status' });
    }

    return res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/execution/:ventureId/sprint
 * @desc    Get active 7-day sprint data
 * @access  Private
 */
router.get('/:ventureId/sprint', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const sprint = await getActiveSprint(ventureId, userId);
    return res.status(200).json({ success: true, sprint });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/execution/sprints/:sprintId/goal
 * @desc    Update sprint weekly goal
 * @access  Private
 */
router.patch('/sprints/:sprintId/goal', async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    const { weeklyGoal } = req.body;

    const updated = await updateSprintGoal(sprintId, weeklyGoal);
    return res.status(200).json({ success: true, sprint: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/execution/:ventureId/milestones
 * @desc    Get phase milestones and progress
 * @access  Private
 */
router.get('/:ventureId/milestones', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const milestones = await getMilestonesForVenture(ventureId, userId);
    return res.status(200).json({ success: true, milestones });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/execution/:ventureId/progress
 * @desc    Get live 5-pillar progress scores
 * @access  Private
 */
router.get('/:ventureId/progress', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const progress = await calculatePillarProgress(ventureId);
    return res.status(200).json({ success: true, progress });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/execution/:ventureId/review
 * @desc    Get latest weekly executive review summary
 * @access  Private
 */
router.get('/:ventureId/review', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const venture = await Venture.findOne({ _id: ventureId, owner: userId });

    const review = await getLatestWeeklyReview(ventureId, userId, venture);
    return res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/execution/:ventureId/review/generate
 * @desc    Trigger manual refresh of weekly review
 * @access  Private
 */
router.post('/:ventureId/review/generate', async (req, res, next) => {
  try {
    const { ventureId } = req.params;
    const userId = req.user.id;
    const venture = await Venture.findOne({ _id: ventureId, owner: userId });

    const review = await generateWeeklyReview({ ventureId, userId, venture });
    return res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
