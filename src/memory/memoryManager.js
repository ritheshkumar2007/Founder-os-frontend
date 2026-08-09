const { getVentureMemory, saveVentureMemory } = require('./memoryService');
const { updateSection, appendSection } = require('./memoryUpdater');
const { getRelevantMemoryForAgent } = require('./memoryRetriever');
const { buildAgentContext } = require('./contextBuilder');
const MEMORY_TYPES = require('./memoryTypes');

/**
 * Summarize long text content if it exceeds token limit
 */
function summarizeMemory(content, maxLength = 600) {
  if (typeof content !== 'string') return String(content || '');
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '... [Summarized memory snapshot]';
}

const memoryManager = {
  MEMORY_TYPES,

  async getMemory(ventureId) {
    return await getVentureMemory(ventureId);
  },

  async saveMemory(ventureId, memoryData) {
    return await saveVentureMemory(ventureId, memoryData);
  },

  async updateMemory(ventureId, sectionKey, content, updatedBy = 'system') {
    return await updateSection(ventureId, sectionKey, content, updatedBy);
  },

  async appendMemory(ventureId, sectionKey, content, updatedBy = 'system') {
    return await appendSection(ventureId, sectionKey, content, updatedBy);
  },

  async deleteMemory(ventureId) {
    const memory = await getVentureMemory(ventureId);
    if (!memory) return false;
    memory.ideaValidation = {};
    memory.build = {};
    memory.growth = {};
    await saveVentureMemory(ventureId, memory);
    return true;
  },

  async buildContext(ventureId, agentName, userQuestion, options = {}) {
    return await buildAgentContext({ ventureId, agentName, userQuestion, options });
  },

  summarizeMemory,

  async getRelevantMemoryForAgent(ventureId, agentName) {
    return await getRelevantMemoryForAgent(ventureId, agentName);
  },
};

module.exports = memoryManager;
