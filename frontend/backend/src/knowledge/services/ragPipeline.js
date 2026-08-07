const { assembleRAGContext } = require('../retrieval/contextAssembler');
const { buildPrompt } = require('../../prompts/buildPrompt');

/**
 * End-to-End RAG Pipeline Orchestrator for FounderOS AI Agents
 */
async function executeRAGPipeline({ ventureId, ownerId, agentName, userQuestion, history = [], options = {} }) {
  // 1. Assemble multi-source RAG context (Layer 2 Memory + Layer 3 Document Chunks)
  const fullRAGContext = await assembleRAGContext({
    ventureId,
    ownerId,
    agentName,
    userQuestion,
    history,
  });

  // 2. Inject into Layer 1 Prompt Engine to build full system prompt
  const systemPrompt = buildPrompt({
    role: options.role || agentName || 'FounderOS AI Agent',
    objective: options.objective || 'Provide founder-grade guidance using retrieved venture memory and document knowledge.',
    agentInstructions: options.agentInstructions || '',
    ventureContext: fullRAGContext,
    userInput: userQuestion,
    includeCompetitors: options.includeCompetitors || false,
  });

  return {
    systemPrompt,
    ragContext: fullRAGContext,
  };
}

module.exports = {
  executeRAGPipeline,
};
