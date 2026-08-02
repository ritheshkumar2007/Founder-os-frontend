const { validationResult } = require('express-validator');

/**
 * Helper to calculate launch sprint progress metrics automatically
 */
const recalculateSprintProgress = (sprint) => {
  let totalTasks = 0;
  let completedTasks = 0;
  let firstUnfinishedDay = null;

  if (Array.isArray(sprint.days)) {
    sprint.days.forEach((dayObj) => {
      let dayHasIncompleteTask = false;
      if (Array.isArray(dayObj.tasks)) {
        dayObj.tasks.forEach((task) => {
          totalTasks += 1;
          if (task.completed) {
            completedTasks += 1;
          } else {
            dayHasIncompleteTask = true;
          }
        });
      }
      if (dayHasIncompleteTask && firstUnfinishedDay === null) {
        firstUnfinishedDay = dayObj.day;
      }
    });
  }

  const remainingTasks = totalTasks - completedTasks;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const currentDay = firstUnfinishedDay !== null ? firstUnfinishedDay : (sprint.days?.length || 1);

  sprint.overallProgress = overallProgress;
  sprint.completedTasks = completedTasks;
  sprint.remainingTasks = remainingTasks;
  sprint.currentDay = currentDay;
};

/**
 * Generate default 7-day launch sprint structure
 */
const generateDefaultLaunchSprint = () => {
  const defaultDays = [
    {
      day: 1,
      title: 'Finalize MVP and landing page',
      tasks: [
        { text: 'Finalize core MVP features & test end-to-end flow', completed: false, notes: '' },
        { text: 'Deploy landing page with clear CTA and sign-up form', completed: false, notes: '' },
      ],
    },
    {
      day: 2,
      title: 'Create outreach list',
      tasks: [
        { text: 'Identify 25 ideal prospects on LinkedIn/Twitter matching ICP', completed: false, notes: '' },
        { text: 'Draft personalized direct outreach templates', completed: false, notes: '' },
      ],
    },
    {
      day: 3,
      title: 'Contact 10 potential users',
      tasks: [
        { text: 'Send direct messages to first 10 potential users', completed: false, notes: '' },
        { text: 'Track outreach responses and schedule follow-ups', completed: false, notes: '' },
      ],
    },
    {
      day: 4,
      title: 'Post in one relevant community',
      tasks: [
        { text: 'Draft value-first post for Indie Hackers / Reddit / Discord', completed: false, notes: '' },
        { text: 'Publish community post and respond actively to comments', completed: false, notes: '' },
      ],
    },
    {
      day: 5,
      title: 'Demo to early users',
      tasks: [
        { text: 'Conduct product walk-through / demo with early prospects', completed: false, notes: '' },
        { text: 'Record user feedback and identify UX friction points', completed: false, notes: '' },
      ],
    },
    {
      day: 6,
      title: 'Collect feedback',
      tasks: [
        { text: 'Send short feedback survey to active testers', completed: false, notes: '' },
        { text: 'Synthesize feature requests and bug reports', completed: false, notes: '' },
      ],
    },
    {
      day: 7,
      title: 'Review results',
      tasks: [
        { text: 'Review total signups, active users, and conversions', completed: false, notes: '' },
        { text: 'Plan next iteration based on launch feedback', completed: false, notes: '' },
      ],
    },
  ];

  const sprint = {
    successGoal: 'Get 5 early users to try the product.',
    days: defaultDays,
    isSaved: true,
  };

  recalculateSprintProgress(sprint);
  return sprint;
};

/**
 * Format sprint object for API response
 */
const formatSprintResponse = (sprint) => {
  return {
    overallProgress: sprint.overallProgress || 0,
    currentDay: sprint.currentDay || 1,
    remainingTasks: sprint.remainingTasks || 0,
    completedTasks: sprint.completedTasks || 0,
    successGoal: sprint.successGoal || 'Get 5 early users to try the product.',
    days: (sprint.days || []).map((d) => ({
      _id: d._id,
      day: d.day,
      title: d.title,
      tasks: (d.tasks || []).map((t) => ({
        id: t._id,
        _id: t._id,
        text: t.text,
        completed: Boolean(t.completed),
        notes: t.notes || '',
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    })),
    createdAt: sprint.createdAt,
    updatedAt: sprint.updatedAt,
  };
};

/**
 * @desc    Get Launch Sprint (generates & saves default if not existing)
 * @route   GET /api/ventures/:ventureId/launch-sprint
 * @access  Private (Owner only)
 */
const getLaunchSprint = async (req, res, next) => {
  try {
    let sprint = req.venture.launchSprint;

    // If sprint is not saved or empty, generate default sprint
    if (!sprint || !sprint.isSaved || !sprint.days || sprint.days.length === 0) {
      const defaultSprint = generateDefaultLaunchSprint();
      req.venture.launchSprint = {
        ...defaultSprint,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await req.venture.save();
      sprint = req.venture.launchSprint;
    } else {
      // Recalculate progress metrics
      recalculateSprintProgress(sprint);
      await req.venture.save();
    }

    res.status(200).json({
      success: true,
      launchSprint: formatSprintResponse(sprint),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update full Launch Sprint
 * @route   POST /api/ventures/:ventureId/launch-sprint
 * @route   PUT /api/ventures/:ventureId/launch-sprint
 * @access  Private (Owner only)
 */
const saveLaunchSprint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { successGoal, days } = req.body;
    const sprint = req.venture.launchSprint || {};

    if (successGoal !== undefined) {
      sprint.successGoal = successGoal;
    }

    if (Array.isArray(days)) {
      sprint.days = days;
    }

    sprint.isSaved = true;
    sprint.updatedAt = new Date();

    recalculateSprintProgress(sprint);

    req.venture.launchSprint = sprint;

    // Update venture progress tracking
    const completedSteps = new Set(
      req.venture.ideaValidation?.progress?.completedSteps || []
    );
    completedSteps.add('Launch Sprint');
    req.venture.ideaValidation.progress.completedSteps = Array.from(completedSteps);
    req.venture.ideaValidation.progress.currentStep = 'Launch Sprint';

    await req.venture.save();

    res.status(200).json({
      success: true,
      launchSprint: formatSprintResponse(req.venture.launchSprint),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a task to a specific sprint day
 * @route   POST /api/ventures/:ventureId/launch-sprint/tasks
 * @access  Private (Owner only)
 */
const addTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { day, text, notes } = req.body;
    const targetDay = Number(day) || 1;

    let sprint = req.venture.launchSprint;
    if (!sprint || !sprint.days || sprint.days.length === 0) {
      sprint = generateDefaultLaunchSprint();
      req.venture.launchSprint = sprint;
    }

    let dayObj = sprint.days.find((d) => d.day === targetDay);
    if (!dayObj) {
      dayObj = { day: targetDay, title: `Day ${targetDay}`, tasks: [] };
      sprint.days.push(dayObj);
    }

    dayObj.tasks.push({
      text,
      completed: false,
      notes: notes || '',
    });

    recalculateSprintProgress(sprint);
    req.venture.launchSprint.updatedAt = new Date();

    await req.venture.save();

    res.status(201).json({
      success: true,
      launchSprint: formatSprintResponse(req.venture.launchSprint),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a sprint task (toggle completion, edit text or notes)
 * @route   PUT /api/ventures/:ventureId/launch-sprint/tasks/:taskId
 * @access  Private (Owner only)
 */
const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { taskId } = req.params;
    const { text, completed, notes } = req.body;

    const sprint = req.venture.launchSprint;
    if (!sprint || !sprint.days) {
      return res.status(404).json({
        success: false,
        message: 'Launch sprint not found',
      });
    }

    let foundTask = null;
    sprint.days.forEach((dayObj) => {
      if (dayObj.tasks) {
        const task = dayObj.tasks.id(taskId);
        if (task) {
          foundTask = task;
        }
      }
    });

    if (!foundTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in launch sprint',
      });
    }

    if (text !== undefined) foundTask.text = text;
    if (completed !== undefined) foundTask.completed = Boolean(completed);
    if (notes !== undefined) foundTask.notes = notes;

    recalculateSprintProgress(sprint);
    sprint.updatedAt = new Date();

    await req.venture.save();

    res.status(200).json({
      success: true,
      updatedTask: {
        id: foundTask._id,
        _id: foundTask._id,
        text: foundTask.text,
        completed: foundTask.completed,
        notes: foundTask.notes,
      },
      launchSprint: formatSprintResponse(sprint),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task from launch sprint
 * @route   DELETE /api/ventures/:ventureId/launch-sprint/tasks/:taskId
 * @access  Private (Owner only)
 */
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const sprint = req.venture.launchSprint;
    if (!sprint || !sprint.days) {
      return res.status(404).json({
        success: false,
        message: 'Launch sprint not found',
      });
    }

    let deleted = false;
    sprint.days.forEach((dayObj) => {
      if (dayObj.tasks && dayObj.tasks.id(taskId)) {
        dayObj.tasks.pull(taskId);
        deleted = true;
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in launch sprint',
      });
    }

    recalculateSprintProgress(sprint);
    sprint.updatedAt = new Date();

    await req.venture.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      launchSprint: formatSprintResponse(sprint),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLaunchSprint,
  saveLaunchSprint,
  addTask,
  updateTask,
  deleteTask,
};
