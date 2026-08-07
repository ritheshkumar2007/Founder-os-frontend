const mongoose = require('mongoose');
const KnowledgeDocument = require('../../models/KnowledgeDocument');

/**
 * Compute cosine similarity between two numeric vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const minLen = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// In-memory vector store cache for offline mode / fast retrieval
const vectorCache = new Map();

class VectorStore {
  /**
   * Save chunks with embeddings into storage
   */
  async storeDocumentChunks({ ventureId, ownerId, documentType, title, source, chunks, metadata }) {
    const docData = {
      ventureId,
      ownerId,
      documentType,
      title,
      source: source || 'upload',
      chunks,
      metadata: {
        ...(metadata || {}),
        chunkCount: chunks.length,
      },
    };

    const strVentureId = String(ventureId);
    if (!vectorCache.has(strVentureId)) {
      vectorCache.set(strVentureId, []);
    }
    vectorCache.get(strVentureId).push(docData);

    if (mongoose.connection.readyState === 1) {
      try {
        return await KnowledgeDocument.create(docData);
      } catch (err) {
        console.warn('VectorStore DB save warning:', err.message);
      }
    }

    return docData;
  }

  /**
   * Search vector store for top N similar chunks matching queryEmbedding strictly filtered by ventureId
   */
  async searchSimilar({ ventureId, ownerId, queryEmbedding, queryText, limit = 5, documentTypes = [] }) {
    if (!ventureId) return [];

    let docs = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = { ventureId };
        if (ownerId) query.ownerId = ownerId;
        if (Array.isArray(documentTypes) && documentTypes.length > 0) {
          query.documentType = { $in: documentTypes };
        }
        docs = await KnowledgeDocument.find(query).lean();
      } catch (err) {
        console.warn('VectorStore DB query warning:', err.message);
      }
    }

    if (docs.length === 0) {
      const cached = vectorCache.get(String(ventureId)) || [];
      docs = documentTypes.length > 0 ? cached.filter((d) => documentTypes.includes(d.documentType)) : cached;
    }

    const scoredChunks = [];

    docs.forEach((doc) => {
      if (Array.isArray(doc.chunks)) {
        doc.chunks.forEach((chunk) => {
          let score = cosineSimilarity(queryEmbedding, chunk.embedding || []);

          // Keyword fallback boost if queryText words match chunk content
          if (queryText && typeof queryText === 'string') {
            const queryWords = queryText.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
            const contentLower = (chunk.content || '').toLowerCase();
            let matches = 0;
            queryWords.forEach((w) => {
              if (contentLower.includes(w)) matches++;
            });
            if (queryWords.length > 0) {
              const kwScore = matches / queryWords.length;
              score = Math.max(score, kwScore * 0.8) + kwScore * 0.1;
            }
          }

          scoredChunks.push({
            score,
            chunkId: chunk.chunkId,
            content: chunk.content,
            documentType: doc.documentType,
            title: doc.title,
            source: doc.source,
            metadata: chunk.metadata || doc.metadata,
            createdAt: doc.createdAt || new Date(),
          });
        });
      }
    });

    return scoredChunks.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Delete document by ID or ventureId
   */
  async deleteEmbeddings({ ventureId, documentId }) {
    if (mongoose.connection.readyState === 1 && documentId) {
      await KnowledgeDocument.findByIdAndDelete(documentId).catch(() => null);
    }
    if (ventureId) {
      vectorCache.delete(String(ventureId));
    }
    return true;
  }
}

module.exports = new VectorStore();
