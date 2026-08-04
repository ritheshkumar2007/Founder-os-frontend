/**
 * FounderOS Centralized Prompt Engine Entry Point
 */
const { buildPrompt, formatVentureContext } = require('./buildPrompt');

// Shared Prompt Components
const founderContext = require('./shared/founderContext');
const toneRules = require('./shared/toneRules');
const constraints = require('./shared/constraints');
const outputRules = require('./shared/outputRules');
const startupPrinciples = require('./shared/startupPrinciples');
const competitors = require('./shared/competitors');

// Agent Prompt Definitions
const ventureBrief = require('./agents/ventureBrief');
const validation = require('./agents/validation');
const competitorAnalysis = require('./agents/competitorAnalysis');
const mvpScope = require('./agents/mvpScope');
const roadmap = require('./agents/roadmap');
const marketingPlan = require('./agents/marketingPlan');
const launchSprint = require('./agents/launchSprint');
const traction = require('./agents/traction');
const investorUpdate = require('./agents/investorUpdate');
const aiChat = require('./agents/aiChat');

module.exports = {
  buildPrompt,
  formatVentureContext,
  shared: {
    founderContext,
    toneRules,
    constraints,
    outputRules,
    startupPrinciples,
    competitors,
  },
  agents: {
    ventureBrief,
    validation,
    competitorAnalysis,
    mvpScope,
    roadmap,
    marketingPlan,
    launchSprint,
    traction,
    investorUpdate,
    aiChat,
  },
};
