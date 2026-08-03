const ExecutionTask = require('../models/ExecutionTask');
const ValidationReport = require('../models/ValidationReport');

/**
 * Calculates live progress scores across the 5 core startup pillars:
 * 1. Validation
 * 2. Product
 * 3. Launch
 * 4. Growth
 * 5. Fundraising
 */
async function calculatePillarProgress(ventureId) {
  if (!ventureId) {
    return {
      validation: 0,
      product: 0,
      launch: 0,
      growth: 0,
      fundraising: 0,
    };
  }

  const allTasks = await ExecutionTask.find({ ventureId });
  const validationReport = await ValidationReport.findOne({ ventureId }).sort({ version: -1 });

  const getPillarPct = (cat, fallbackScore = 0) => {
    const pillarTasks = allTasks.filter((t) => t.category === cat);
    if (pillarTasks.length > 0) {
      const doneTasks = pillarTasks.filter((t) => t.status === 'Done');
      return Math.round((doneTasks.length / pillarTasks.length) * 100);
    }
    return fallbackScore;
  };

  const validationScore = validationReport?.scores?.problemValidation?.score || 30;
  const productScore = validationReport?.scores?.executionReadiness?.score || 15;
  const launchScore = validationReport?.scores?.marketValidation?.score || 10;
  const growthScore = validationReport?.scores?.customerValidation?.score || 10;
  const fundraisingScore = validationReport?.scores?.competition?.score || 10;

  return {
    validation: getPillarPct('Validation', validationScore),
    product: getPillarPct('Product', productScore),
    launch: getPillarPct('Launch', launchScore),
    growth: getPillarPct('Growth', growthScore),
    fundraising: getPillarPct('Fundraising', fundraisingScore),
  };
}

module.exports = {
  calculatePillarProgress,
};
