/**
 * FounderOS Configurable Directed Acyclic Graph (DAG) for Workflow Intelligence
 */

const WORKFLOW_MODULES = {
  VENTURE_BRIEF: 'venture_brief',
  VALIDATION: 'validation',
  VALIDATION_SUMMARY: 'validation_summary',
  MVP_SCOPE: 'mvp_scope',
  ROADMAP: 'roadmap',
  MARKETING_PLAN: 'marketing_plan',
  LAUNCH_SPRINT: 'launch_sprint',
  TRACTION: 'traction',
  INVESTOR_UPDATE: 'investor_update',
};

const WORKFLOW_STAGES = {
  IDEA_VALIDATION: 'Idea Validation',
  BUILD: 'Build',
  GO_TO_MARKET: 'Go To Market',
  GROWTH: 'Growth',
};

const WORKFLOW_NODES = {
  [WORKFLOW_MODULES.VENTURE_BRIEF]: {
    id: WORKFLOW_MODULES.VENTURE_BRIEF,
    name: 'Venture Brief',
    stage: WORKFLOW_STAGES.IDEA_VALIDATION,
    weight: 15,
  },
  [WORKFLOW_MODULES.VALIDATION]: {
    id: WORKFLOW_MODULES.VALIDATION,
    name: 'Customer Validation',
    stage: WORKFLOW_STAGES.IDEA_VALIDATION,
    weight: 15,
  },
  [WORKFLOW_MODULES.VALIDATION_SUMMARY]: {
    id: WORKFLOW_MODULES.VALIDATION_SUMMARY,
    name: 'Validation Summary',
    stage: WORKFLOW_STAGES.IDEA_VALIDATION,
    weight: 10,
  },
  [WORKFLOW_MODULES.MVP_SCOPE]: {
    id: WORKFLOW_MODULES.MVP_SCOPE,
    name: 'MVP Scope',
    stage: WORKFLOW_STAGES.BUILD,
    weight: 15,
  },
  [WORKFLOW_MODULES.ROADMAP]: {
    id: WORKFLOW_MODULES.ROADMAP,
    name: 'Build Roadmap',
    stage: WORKFLOW_STAGES.BUILD,
    weight: 10,
  },
  [WORKFLOW_MODULES.MARKETING_PLAN]: {
    id: WORKFLOW_MODULES.MARKETING_PLAN,
    name: 'Marketing Plan',
    stage: WORKFLOW_STAGES.GO_TO_MARKET,
    weight: 10,
  },
  [WORKFLOW_MODULES.LAUNCH_SPRINT]: {
    id: WORKFLOW_MODULES.LAUNCH_SPRINT,
    name: 'Launch Sprint',
    stage: WORKFLOW_STAGES.GO_TO_MARKET,
    weight: 10,
  },
  [WORKFLOW_MODULES.TRACTION]: {
    id: WORKFLOW_MODULES.TRACTION,
    name: 'Traction Metrics',
    stage: WORKFLOW_STAGES.GROWTH,
    weight: 8,
  },
  [WORKFLOW_MODULES.INVESTOR_UPDATE]: {
    id: WORKFLOW_MODULES.INVESTOR_UPDATE,
    name: 'Investor Update',
    stage: WORKFLOW_STAGES.GROWTH,
    weight: 7,
  },
};

// Dependency Edges (from -> to)
const WORKFLOW_EDGES = [
  { from: WORKFLOW_MODULES.VENTURE_BRIEF, to: WORKFLOW_MODULES.VALIDATION },
  { from: WORKFLOW_MODULES.VALIDATION, to: WORKFLOW_MODULES.VALIDATION_SUMMARY },
  { from: WORKFLOW_MODULES.VALIDATION_SUMMARY, to: WORKFLOW_MODULES.MVP_SCOPE },
  { from: WORKFLOW_MODULES.MVP_SCOPE, to: WORKFLOW_MODULES.ROADMAP },
  { from: WORKFLOW_MODULES.ROADMAP, to: WORKFLOW_MODULES.MARKETING_PLAN },
  { from: WORKFLOW_MODULES.MARKETING_PLAN, to: WORKFLOW_MODULES.LAUNCH_SPRINT },
  { from: WORKFLOW_MODULES.LAUNCH_SPRINT, to: WORKFLOW_MODULES.TRACTION },
  { from: WORKFLOW_MODULES.TRACTION, to: WORKFLOW_MODULES.INVESTOR_UPDATE },
];

/**
 * Get downstream nodes affected by an upstream node change
 */
function getDownstreamNodes(nodeId) {
  const downstream = new Set();

  function traverse(currentId) {
    WORKFLOW_EDGES.filter((e) => e.from === currentId).forEach((edge) => {
      if (!downstream.has(edge.to)) {
        downstream.add(edge.to);
        traverse(edge.to);
      }
    });
  }

  traverse(nodeId);
  return Array.from(downstream);
}

module.exports = {
  WORKFLOW_MODULES,
  WORKFLOW_STAGES,
  WORKFLOW_NODES,
  WORKFLOW_EDGES,
  getDownstreamNodes,
};
