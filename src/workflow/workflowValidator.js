const { resolveDependencies } = require('./dependencyResolver');
const { getWorkflowState, MODULE_STATES } = require('./workflowState');
const { WORKFLOW_NODES } = require('./workflowGraph');

/**
 * Validate preconditions before running a workflow module
 */
function validateWorkflowPreconditions(ventureId, moduleId) {
  const stateMap = getWorkflowState(ventureId);
  const deps = resolveDependencies(moduleId);

  const warnings = [];
  const missingPrerequisites = [];

  deps.requires.forEach((reqId) => {
    const reqState = stateMap[reqId] || { status: MODULE_STATES.NOT_STARTED };
    const nodeInfo = WORKFLOW_NODES[reqId] || { name: reqId };

    if (reqState.status !== MODULE_STATES.COMPLETED) {
      missingPrerequisites.push(nodeInfo.name);
      if (reqState.status === MODULE_STATES.NEEDS_REVIEW) {
        warnings.push(`Prerequisite "${nodeInfo.name}" is marked as Needs Review.`);
      } else {
        warnings.push(`Prerequisite "${nodeInfo.name}" has not been completed yet.`);
      }
    }
  });

  const isValid = missingPrerequisites.length === 0;

  return {
    isValid,
    canOverride: true, // Allow soft overrides with warnings
    missingPrerequisites,
    warnings,
  };
}

module.exports = {
  validateWorkflowPreconditions,
};
