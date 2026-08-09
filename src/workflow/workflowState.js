const { WORKFLOW_MODULES, getDownstreamNodes } = require('./workflowGraph');

const MODULE_STATES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  NEEDS_REVIEW: 'Needs Review',
  BLOCKED: 'Blocked',
};

// In-memory state store fallback for ventures
const ventureWorkflowStates = new Map();

function getDefaultStateMap() {
  const map = {};
  Object.values(WORKFLOW_MODULES).forEach((mod) => {
    map[mod] = {
      status: MODULE_STATES.NOT_STARTED,
      updatedAt: new Date(),
      lastModifiedBy: 'system',
    };
  });
  return map;
}

function getWorkflowState(ventureId) {
  if (!ventureId) return getDefaultStateMap();
  const strId = String(ventureId);
  if (!ventureWorkflowStates.has(strId)) {
    ventureWorkflowStates.set(strId, getDefaultStateMap());
  }
  return ventureWorkflowStates.get(strId);
}

/**
 * Update state for a module and propagate 'Needs Review' status downstream if requested
 */
function setModuleState(ventureId, moduleId, status, options = {}) {
  if (!ventureId || !moduleId) return null;
  const stateMap = getWorkflowState(ventureId);

  stateMap[moduleId] = {
    status,
    updatedAt: new Date(),
    lastModifiedBy: options.updatedBy || 'user',
  };

  // Change propagation: if upstream module updated, mark downstream as Needs Review
  if (options.propagateDownstream && status === MODULE_STATES.COMPLETED) {
    const downstreamNodes = getDownstreamNodes(moduleId);
    downstreamNodes.forEach((downstreamId) => {
      if (
        stateMap[downstreamId] &&
        stateMap[downstreamId].status === MODULE_STATES.COMPLETED
      ) {
        stateMap[downstreamId].status = MODULE_STATES.NEEDS_REVIEW;
        stateMap[downstreamId].updatedAt = new Date();
      }
    });
  }

  return stateMap[moduleId];
}

module.exports = {
  MODULE_STATES,
  getWorkflowState,
  setModuleState,
};
