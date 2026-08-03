const Sprint = require('../models/Sprint');
const ExecutionTask = require('../models/ExecutionTask');

/**
 * Get or initialize active 7-day sprint for a venture
 */
async function getActiveSprint(ventureId, userId) {
  if (!ventureId || !userId) return null;

  let sprint = await Sprint.findOne({ ventureId, status: 'ACTIVE' }).populate('taskIds');

  if (!sprint) {
    // Find top tasks for this sprint
    const sprintTasks = await ExecutionTask.find({ ventureId, status: { $ne: 'Done' } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5);

    sprint = await Sprint.create({
      ventureId,
      userId,
      weekNumber: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      weeklyGoal: 'Validate core customer problem and build 2-week MVP scope',
      status: 'ACTIVE',
      taskIds: sprintTasks.map((t) => t._id),
    });

    sprint = await Sprint.findById(sprint._id).populate('taskIds');
  }

  return sprint;
}

/**
 * Update sprint weekly goal or commitments
 */
async function updateSprintGoal(sprintId, weeklyGoal) {
  if (!sprintId || !weeklyGoal) return null;
  return await Sprint.findByIdAndUpdate(sprintId, { weeklyGoal: weeklyGoal.trim() }, { new: true });
}

module.exports = {
  getActiveSprint,
  updateSprintGoal,
};
