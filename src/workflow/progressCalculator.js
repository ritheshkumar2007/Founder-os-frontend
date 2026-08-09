const { WORKFLOW_MODULES, WORKFLOW_NODES, WORKFLOW_STAGES } = require('./workflowGraph');
const { getWorkflowState, MODULE_STATES } = require('./workflowState');

/**
 * Automatically calculate venture progress percentage overall and per stage
 */
function calculateVentureProgress(ventureId) {
  const stateMap = getWorkflowState(ventureId);

  const stageTotals = {
    [WORKFLOW_STAGES.IDEA_VALIDATION]: { total: 0, completed: 0 },
    [WORKFLOW_STAGES.BUILD]: { total: 0, completed: 0 },
    [WORKFLOW_STAGES.GO_TO_MARKET]: { total: 0, completed: 0 },
    [WORKFLOW_STAGES.GROWTH]: { total: 0, completed: 0 },
  };

  let totalWeight = 0;
  let earnedWeight = 0;

  Object.values(WORKFLOW_NODES).forEach((node) => {
    const state = stateMap[node.id] || { status: MODULE_STATES.NOT_STARTED };
    const weight = node.weight || 10;
    totalWeight += weight;

    if (stageTotals[node.stage]) {
      stageTotals[node.stage].total += 1;
    }

    if (state.status === MODULE_STATES.COMPLETED) {
      earnedWeight += weight;
      if (stageTotals[node.stage]) {
        stageTotals[node.stage].completed += 1;
      }
    } else if (state.status === MODULE_STATES.NEEDS_REVIEW) {
      earnedWeight += weight * 0.8;
      if (stageTotals[node.stage]) {
        stageTotals[node.stage].completed += 0.8;
      }
    }
  });

  const overallProgress = Math.min(100, Math.round((earnedWeight / totalWeight) * 100));

  const stagesProgress = {};
  Object.keys(stageTotals).forEach((stageKey) => {
    const { total, completed } = stageTotals[stageKey];
    stagesProgress[stageKey] = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  });

  return {
    overallProgress,
    stagesProgress,
  };
}

module.exports = {
  calculateVentureProgress,
};
