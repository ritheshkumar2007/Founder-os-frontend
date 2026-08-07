const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Deterministic lightweight fallback vector generator for offline / fallback search
 * Generates a 64-dimensional normalized term frequency embedding vector.
 */
function generateFallbackEmbedding(text) {
  const dim = 64;
  const vector = new Array(dim).fill(0);
  if (!text || typeof text !== 'string') return vector;

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = normalized.split(/\s+/).filter(Boolean);

  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % dim;
    vector[index] += 1;
  });

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

/**
 * Generate embedding vector using Gemini API or fallback
 */
async function createEmbedding(text) {
  if (!text || typeof text !== 'string') return generateFallbackEmbedding('');

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      if (result && result.embedding && Array.isArray(result.embedding.values)) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn('Gemini embedding API fallback:', err.message);
    }
  }

  return generateFallbackEmbedding(text);
}

/**
 * Batch generate embeddings
 */
async function createEmbeddingsBatch(texts = []) {
  return await Promise.all(texts.map((t) => createEmbedding(t)));
}

module.exports = {
  createEmbedding,
  createEmbeddingsBatch,
  generateFallbackEmbedding,
};
