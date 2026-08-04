const founderContext = require('../shared/founderContext');
const startupPrinciples = require('../shared/startupPrinciples');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');
const outputRules = require('../shared/outputRules');
const { competitorsPrompt } = require('../shared/competitors');

/**
 * Format venture context safely with default fallbacks
 */
function formatVentureContext(context = {}) {
  if (typeof context === 'string') return context;
  const name = context.ventureName || context.name || 'Unnamed Venture';
  const industry = context.industry || 'Not specified';
  const stage = context.stage || 'Idea';
  const customer = context.targetCustomer || context.customer || 'Not specified';
  const businessModel = context.businessModel || 'Not specified';
  const goal = context.goal || 'Not specified';

  return `
=== ACTIVE VENTURE CONTEXT ===
Name: ${name}
Industry: ${industry}
Stage: ${stage}
Target Customer: ${customer}
Business Model: ${businessModel}
Goal: ${goal}
=== END ACTIVE VENTURE CONTEXT ===
`.trim();
}

/**
 * Centralized Prompt Builder for FounderOS LLM Requests
 *
 * Rule Precedence Order:
 * 1. Safety rules
 * 2. Agent-specific instructions (role, objective, agentInstructions)
 * 3. Shared constraints
 * 4. Tone rules
 * 5. Output formatting rules
 */
function buildPrompt(options = {}) {
  const {
    role = 'Startup Advisor Agent',
    objective = 'Provide structured founder guidance.',
    agentInstructions = '',
    ventureContext = null,
    userInput = '',
    includeCompetitors = false,
  } = options;

  const agentRoleHeader = `=== AGENT ROLE & OBJECTIVE ===\nRole: ${role}\nObjective: ${objective}\n${agentInstructions ? agentInstructions.trim() : ''}`.trim();

  const formattedVenture = ventureContext ? formatVentureContext(ventureContext) : null;
  const formattedUserInput = userInput ? `=== USER REQUEST ===\n${userInput}` : null;

  const sections = [
    founderContext,
    startupPrinciples,
    toneRules,
    constraints,
    outputRules,
    includeCompetitors ? competitorsPrompt : null,
    formattedVenture,
    agentRoleHeader,
    formattedUserInput,
  ];

  return sections.filter(Boolean).join('\n\n');
}

module.exports = {
  buildPrompt,
  formatVentureContext,
};
