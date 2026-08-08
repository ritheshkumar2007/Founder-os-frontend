const SHARED_CONTEXT = require('./shared/founderContext');
const TONE = require('./shared/toneRules');
const CONSTRAINTS = require('./shared/constraints');
const OUTPUT_RULES = require('./shared/outputRules');

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
 * FounderOS Master Prompt Composition Engine
 * Assembles: SHARED_CONTEXT + TONE + CONSTRAINTS + OUTPUT_RULES + AGENT INSTRUCTIONS + USER CONTEXT
 */
function buildPrompt(options = {}) {
  const agentName = options.agentName || options.role || 'Startup Advisor Agent';
  const agentInstructions = options.agentInstructions || options.responsibilities || options.objective || 'Provide direct, structured founder guidance.';
  const userContext = options.userContext || (options.ventureContext ? formatVentureContext(options.ventureContext) : '');
  const userInput = options.userInput ? `\n## CURRENT USER REQUEST\n${options.userInput}` : '';

  return [
    SHARED_CONTEXT,
    TONE,
    CONSTRAINTS,
    OUTPUT_RULES,
    `\n## AGENT: ${agentName}\n${agentInstructions}`,
    userContext ? `\n## USER CONTEXT\n${userContext}` : '',
    userInput,
  ].filter(Boolean).join('\n\n');
}

module.exports = {
  buildPrompt,
  formatVentureContext,
  SHARED_CONTEXT,
  TONE,
  CONSTRAINTS,
  OUTPUT_RULES,
};

