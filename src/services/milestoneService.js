const Milestone = require('../models/Milestone');
const ExecutionTask = require('../models/ExecutionTask');

const DEFAULT_MILESTONES = [
  { title: 'Phase 1: Idea & Customer Problem Validation', category: 'Validation', status: 'IN_PROGRESS' },
  { title: 'Phase 2: MVP Product Build & Testing', category: 'Product', status: 'PLANNED' },
  { title: 'Phase 3: Launch Sprint & First 100 Users', category: 'Launch', status: 'PLANNED' },
  { title: 'Phase 4: Traction & Revenue Scaling', category: 'Growth', status: 'PLANNED' },
  { title: 'Phase 5: Investor Readiness & Seed Pitching', category: 'Fundraising', status: 'PLANNED' },
];

/**
 * Initialize default milestones for a new venture if not present
 */
async function initializeVentureMilestones(ventureId, userId) {
  if (!ventureId || !userId) return [];

  const existing = await Milestone.find({ ventureId });
  if (existing.length > 0) return existing;

  const created = await Promise.all(
    DEFAULT_MILESTONES.map(async (m, idx) => {
      return await Milestone.create({
        ventureId,
        userId,
        title: m.title,
        category: m.category,
        status: m.status,
        targetDate: new Date(Date.now() + (idx + 1) * 14 * 24 * 60 * 60 * 1000), // 2-week intervals
        progressPercentage: idx === 0 ? 30 : 0,
      });
    })
  );

  return created;
}

/**
 * Get milestones for a venture with dynamically computed progress percentages
 */
async function getMilestonesForVenture(ventureId, userId) {
  if (!ventureId) return [];

  await initializeVentureMilestones(ventureId, userId);

  const milestones = await Milestone.find({ ventureId });
  const allTasks = await ExecutionTask.find({ ventureId });

  const updatedMilestones = await Promise.all(
    milestones.map(async (m) => {
      const categoryTasks = allTasks.filter((t) => t.category === m.category);
      let pct = m.progressPercentage;

      if (categoryTasks.length > 0) {
        const doneTasks = categoryTasks.filter((t) => t.status === 'Done');
        pct = Math.round((doneTasks.length / categoryTasks.length) * 100);
      }

      if (pct !== m.progressPercentage) {
        m.progressPercentage = pct;
        if (pct >= 100) m.status = 'COMPLETED';
        else if (pct > 0) m.status = 'IN_PROGRESS';
        await m.save();
      }

      return m;
    })
  );

  return updatedMilestones;
}

module.exports = {
  initializeVentureMilestones,
  getMilestonesForVenture,
};
