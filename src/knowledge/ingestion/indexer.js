const { parseDocumentText } = require('./documentParser');
const { chunkText } = require('./chunker');
const { embedChunks } = require('./embedder');
const vectorStore = require('../providers/vectorStore');

/**
 * End-to-end ingestion pipeline for documents and notes
 */
async function indexDocument({ ventureId, ownerId, documentType = 'txt', title, content, fileName, source = 'upload', metadata = {} }) {
  if (!ventureId || !content) {
    throw new Error('ventureId and content are required for document ingestion');
  }

  // 1. Parse clean text
  const cleanText = parseDocumentText({ content, fileName, documentType });
  if (!cleanText) return null;

  // 2. Chunk text
  const rawChunks = chunkText(cleanText);

  // 3. Generate embeddings
  const embeddedChunks = await embedChunks(rawChunks);

  // 4. Store in vector database
  return await vectorStore.storeDocumentChunks({
    ventureId,
    ownerId,
    documentType,
    title: title || fileName || `${documentType.toUpperCase()} Document`,
    source,
    chunks: embeddedChunks,
    metadata: {
      ...metadata,
      fileSize: cleanText.length,
      wordCount: cleanText.split(/\s+/).length,
    },
  });
}

module.exports = {
  indexDocument,
};
