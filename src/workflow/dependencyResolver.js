const { WORKFLOW_MODULES } = require('./workflowGraph');

const MODULE_DEPENDENCIES = {
  [WORKFLOW_MODULES.VENTURE_BRIEF]: {
    requires: [],
    produces: ['Problem Statement', 'Target Customer', 'Core Idea Brief'],
    consumes: [],
  },
  [WORKFLOW_MODULES.VALIDATION]: {
    requires: [WORKFLOW_MODULES.VENTURE_BRIEF],
    produces: ['Customer Pain Points', 'Interview Insights', 'Validation Score'],
    consumes: ['Problem Statement', 'Target Customer'],
  },
  [WORKFLOW_MODULES.VALIDATION_SUMMARY]: {
    requires: [WORKFLOW_MODULES.VALIDATION],
    produces: ['Validation Executive Summary', 'Go/No-Go Signal'],
    consumes: ['Interview Insights', 'Validation Score'],
  },
  [WORKFLOW_MODULES.MVP_SCOPE]: {
    requires: [WORKFLOW_MODULES.VALIDATION_SUMMARY],
    produces: ['Feature Priorities', 'Build Now vs Build Later Scope'],
    consumes: ['Validation Executive Summary', 'Problem Statement'],
  },
  [WORKFLOW_MODULES.ROADMAP]: {
    requires: [WORKFLOW_MODULES.MVP_SCOPE],
    produces: ['4-Phase Technical Roadmap', 'Milestones & Estimates'],
    consumes: ['Feature Priorities', 'Build Now Scope'],
  },
  [WORKFLOW_MODULES.MARKETING_PLAN]: {
    requires: [WORKFLOW_MODULES.ROADMAP],
    produces: ['10-Part GTM Strategy', 'Acquisition Channels', 'UVP'],
    consumes: ['Target Customer', 'Feature Priorities', 'Milestones'],
  },
  [WORKFLOW_MODULES.LAUNCH_SPRINT]: {
    requires: [WORKFLOW_MODULES.MARKETING_PLAN],
    produces: ['Launch Day Schedule', 'Product Hunt Checklist'],
    consumes: ['10-Part GTM Strategy', 'UVP'],
  },
  [WORKFLOW_MODULES.TRACTION]: {
    requires: [WORKFLOW_MODULES.LAUNCH_SPRINT],
    produces: ['Conversion Metrics', 'Growth Health Score', 'Funnel Analytics'],
    consumes: ['Launch Day Schedule'],
  },
  [WORKFLOW_MODULES.INVESTOR_UPDATE]: {
    requires: [WORKFLOW_MODULES.TRACTION],
    produces: ['Monthly Investor Update Memo', 'Milestone Highlights', 'Investor Asks'],
    consumes: ['Conversion Metrics', '4-Phase Technical Roadmap', 'Growth Health Score'],
  },
};

function resolveDependencies(moduleId) {
  return (
    MODULE_DEPENDENCIES[moduleId] || {
      requires: [],
      produces: [],
      consumes: [],
    }
  );
}

module.exports = {
  MODULE_DEPENDENCIES,
  resolveDependencies,
};
