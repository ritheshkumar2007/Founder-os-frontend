const { createEmbedding, createEmbeddingsBatch } = require('../providers/embeddingProvider');

/**
 * Embed an array of chunk objects
 */
async function embedChunks(chunks = []) {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];

  const texts = chunks.map((c) => c.content);
  const embeddings = await createEmbeddingsBatch(texts);

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index] || [],
  }));
}

module.exports = {
  embedChunks,
  createEmbedding,
};
