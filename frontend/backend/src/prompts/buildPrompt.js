const founderContext = require('./shared/founderContext');
const startupPrinciples = require('./shared/startupPrinciples');
const toneRules = require('./shared/toneRules');
const constraints = require('./shared/constraints');
const outputRules = require('./shared/outputRules');
const { competitorsPrompt } = require('./shared/competitors');

/**
 * Safely format venture context with explicit defaults
 */
function formatVentureContext(context = {}) {
  if (typeof context === 'string') return context;
  const name = context.ventureName || context.name || 'Unnamed Venture';
  const industry = context.industry || 'Not Specified';
  const stage = context.stage || 'Idea';
  const customer = context.targetCustomer || context.customer || 'Not Specified';
  const businessModel = context.businessModel || 'Not Specified';
  const goal = context.goal || 'Not Specified';

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
 * Centralized Prompt Engine Builder for FounderOS
 *
 * Assembles system prompts in strict priority order:
 * 1. FounderOS Context
 * 2. Startup Principles
 * 3. Tone Rules
 * 4. Constraints
 * 5. Output Rules
 * 6. Competitors (optional)
 * 7. Current Venture Context
 * 8. Agent Responsibilities
 * 9. Current User Request
 */
function buildPrompt(options = {}) {
  const {
    role = 'Startup Advisor Agent',
    objective = 'Provide structured founder guidance.',
    responsibilities = '',
    additionalInstructions = '',
    ventureContext = null,
    userInput = '',
    includeCompetitors = false,
  } = options;

  const agentHeader = `
=== AGENT RESPONSIBILITIES & OBJECTIVE ===
Role: ${role}
Objective: ${objective}
${responsibilities ? `Responsibilities:\n${responsibilities.trim()}` : ''}
${additionalInstructions ? `Additional Instructions:\n${additionalInstructions.trim()}` : ''}
=== END AGENT RESPONSIBILITIES ===
`.trim();

  const formattedVenture = ventureContext ? formatVentureContext(ventureContext) : null;
  const formattedUserInput = userInput ? `=== CURRENT USER REQUEST ===\n${userInput}` : null;

  const sections = [
    founderContext,
    startupPrinciples,
    toneRules,
    constraints,
    outputRules,
    includeCompetitors ? competitorsPrompt : null,
    formattedVenture,
    agentHeader,
    formattedUserInput,
  ];

  return sections.filter(Boolean).join('\n\n');
}

module.exports = {
  buildPrompt,
  formatVentureContext,
};
