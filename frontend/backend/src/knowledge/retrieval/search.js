const { createEmbedding } = require('../providers/embeddingProvider');
const vectorStore = require('../providers/vectorStore');

/**
 * Execute vector search with security filtering by ventureId and ownerId
 */
async function searchKnowledge({ ventureId, ownerId, query, limit = 5, documentTypes = [] }) {
  if (!ventureId || !query) return [];

  const queryEmbedding = await createEmbedding(query);

  return await vectorStore.searchSimilar({
    ventureId,
    ownerId,
    queryEmbedding,
    queryText: query,
    limit,
    documentTypes,
  });
}

module.exports = {
  searchKnowledge,
};
