const { getRelevantMemoryForAgent } = require('./memoryRetriever');
const { buildPrompt } = require('../prompts/buildPrompt');

/**
 * Automatically gather and build contextual prompt for AI agents using selective Venture Memory
 */
async function buildAgentContext({ ventureId, agentName, userQuestion, options = {} }) {
  const memoryContext = await getRelevantMemoryForAgent(ventureId, agentName);

  return buildPrompt({
    role: options.role || agentName || 'Startup Co-Pilot Agent',
    objective: options.objective || 'Provide structured founder guidance based on historical venture memory.',
    agentInstructions: options.agentInstructions || '',
    ventureContext: memoryContext,
    userInput: userQuestion,
    includeCompetitors: options.includeCompetitors || false,
  });
}

module.exports = {
  buildAgentContext,
};
