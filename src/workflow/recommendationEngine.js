const { WORKFLOW_EDGES, WORKFLOW_NODES } = require('./workflowGraph');
const { getWorkflowState, MODULE_STATES } = require('./workflowState');

/**
 * Recommend the next highest-value action for the founder based on workflow DAG state
 */
function recommendNextAction(ventureId) {
  const stateMap = getWorkflowState(ventureId);

  // Check for modules marked as Needs Review
  for (const [modId, state] of Object.entries(stateMap)) {
    if (state.status === MODULE_STATES.NEEDS_REVIEW) {
      const node = WORKFLOW_NODES[modId] || { name: modId };
      return {
        recommendedModule: modId,
        actionTitle: `Review ${node.name}`,
        recommendation: `An upstream dependency changed. Review and update your ${node.name} to keep alignment.`,
        priority: 'HIGH',
      };
    }
  }

  // Find the first edge where 'from' is completed but 'to' is not completed
  for (const edge of WORKFLOW_EDGES) {
    const fromState = stateMap[edge.from] || { status: MODULE_STATES.NOT_STARTED };
    const toState = stateMap[edge.to] || { status: MODULE_STATES.NOT_STARTED };

    if (
      (fromState.status === MODULE_STATES.COMPLETED || edge.from === 'venture_brief') &&
      toState.status !== MODULE_STATES.COMPLETED
    ) {
      const toNode = WORKFLOW_NODES[edge.to] || { name: edge.to };
      return {
        recommendedModule: edge.to,
        actionTitle: `Generate ${toNode.name}`,
        recommendation: `Your previous milestone is complete. The next recommended step is generating your ${toNode.name}.`,
        priority: 'MEDIUM',
      };
    }
  }

  // Default fallback
  return {
    recommendedModule: 'venture_brief',
    actionTitle: 'Complete Venture Brief',
    recommendation: 'Fill in your core startup parameters to kick off automated AI validation.',
    priority: 'LOW',
  };
}

module.exports = {
  recommendNextAction,
};
