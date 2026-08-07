const memoryManager = require('../../memory/memoryManager');
const { retrieveRelevantChunks } = require('./retriever');

/**
 * Assemble multi-source RAG context for prompt engine injection
 */
async function assembleRAGContext({ ventureId, ownerId, agentName, userQuestion, history = [] }) {
  // 1. Fetch Layer 2 Venture Memory (Selective for agent)
  const memoryContext = await memoryManager.getRelevantMemoryForAgent(ventureId, agentName);

  // 2. Fetch Layer 3 Searchable Knowledge Chunks (RAG)
  const retrievedChunks = await retrieveRelevantChunks({
    ventureId,
    ownerId,
    query: userQuestion,
    agentName,
    limit: 5,
  });

  // 3. Format Conversation History summary if available
  let conversationSummary = '';
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-4).map((h) => `${h.role === 'user' ? 'User' : 'AI'}: ${h.content}`).join('\n');
    conversationSummary = `[Recent Conversation History]:\n${recent}`;
  }

  // 4. Format Retrieved Document Chunks
  let docChunksContext = '';
  if (retrievedChunks.length > 0) {
    const formattedDocs = retrievedChunks
      .map((c, i) => `Snippet #${i + 1} [Source: ${c.title || c.source || 'Document'}]:\n${c.content}`)
      .join('\n\n');
    docChunksContext = `[Retrieved Knowledge & Uploaded Documents]:\n${formattedDocs}`;
  } else {
    docChunksContext = `[Retrieved Knowledge & Uploaded Documents]:\nNo specific uploaded documents matched this query.`;
  }

  // Combine into clean context string
  const sections = [memoryContext, conversationSummary, docChunksContext];
  return sections.filter(Boolean).join('\n\n');
}

module.exports = {
  assembleRAGContext,
};
