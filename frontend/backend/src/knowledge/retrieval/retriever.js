const { searchKnowledge } = require('./search');
const { rerankResults } = require('./reranker');

const AGENT_DOC_TYPE_MAP = {
  competitor_analysis: ['competitor_research', 'market_research', 'pdf', 'docx', 'notes'],
  competitor_agent: ['competitor_research', 'market_research', 'pdf', 'docx', 'notes'],
  validation: ['interview_notes', 'market_research', 'pdf', 'docx', 'notes'],
  validation_agent: ['interview_notes', 'market_research', 'pdf', 'docx', 'notes'],
  marketing_plan: ['marketing_plan', 'market_research', 'pdf', 'docx', 'notes'],
  marketing_agent: ['marketing_plan', 'market_research', 'pdf', 'docx', 'notes'],
  investor_update: ['investor_update', 'roadmap', 'product_requirements', 'notes'],
  investor_agent: ['investor_update', 'roadmap', 'product_requirements', 'notes'],
  roadmap: ['roadmap', 'product_requirements', 'notes'],
  roadmap_agent: ['roadmap', 'product_requirements', 'notes'],
};

/**
 * Retrieve and rerank relevant chunks for a given query and agent domain
 */
async function retrieveRelevantChunks({ ventureId, ownerId, query, agentName, limit = 5 }) {
  if (!ventureId || !query) return [];

  const normalizedAgent = String(agentName || '').toLowerCase().trim().replace(/[-\s]/g, '_');
  const targetTypes = AGENT_DOC_TYPE_MAP[normalizedAgent] || [];

  const rawResults = await searchKnowledge({
    ventureId,
    ownerId,
    query,
    limit: limit * 2,
    documentTypes: targetTypes,
  });

  return rerankResults(rawResults, { topK: limit });
}

module.exports = {
  retrieveRelevantChunks,
  AGENT_DOC_TYPE_MAP,
};
