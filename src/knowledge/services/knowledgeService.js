const { indexDocument } = require('../ingestion/indexer');
const { searchKnowledge } = require('../retrieval/search');
const { retrieveRelevantChunks } = require('../retrieval/retriever');

class KnowledgeService {
  /**
   * Index an uploaded document, notes, or research report
   */
  async indexDocument(params) {
    return await indexDocument(params);
  }

  /**
   * Search knowledge base for relevant chunks
   */
  async search(params) {
    return await searchKnowledge(params);
  }

  /**
   * Domain-aware retrieval for specific AI agents
   */
  async getAgentKnowledge(params) {
    return await retrieveRelevantChunks(params);
  }

  /**
   * Index user conversation summary into knowledge base
   */
  async indexConversation({ ventureId, ownerId, conversationSummary, title = 'Conversation Summary' }) {
    if (!ventureId || !conversationSummary) return null;
    return await indexDocument({
      ventureId,
      ownerId,
      documentType: 'conversation',
      title,
      content: conversationSummary,
      source: 'chat_system',
    });
  }
}

module.exports = new KnowledgeService();
