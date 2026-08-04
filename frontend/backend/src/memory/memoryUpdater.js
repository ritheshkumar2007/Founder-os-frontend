const { getVentureMemory, saveVentureMemory } = require('./memoryService');

/**
 * Safely get nested property from object using dot notation path
 */
function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

/**
 * Safely set nested property on object using dot notation path
 */
function setByPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Update a specific memory section without overwriting unrelated sections
 */
async function updateSection(ventureId, sectionKey, content, updatedBy = 'system') {
  if (!ventureId || !sectionKey) return null;

  const memory = await getVentureMemory(ventureId);
  if (!memory) return null;

  const existingSection = getByPath(memory, sectionKey) || {};
  const currentVersion = existingSection.version || 0;

  const updatedSection = {
    content: typeof content === 'string' ? content : JSON.stringify(content),
    summary: typeof content === 'string' && content.length > 500 ? content.substring(0, 500) + '...' : String(content || ''),
    version: currentVersion + 1,
    updatedBy,
    lastUpdated: new Date(),
  };

  setByPath(memory, sectionKey, updatedSection);
  memory.version = (memory.version || 1) + 1;

  await saveVentureMemory(ventureId, memory);
  return updatedSection;
}

/**
 * Append content to an existing section
 */
async function appendSection(ventureId, sectionKey, contentToAppend, updatedBy = 'system') {
  if (!ventureId || !sectionKey) return null;
  const memory = await getVentureMemory(ventureId);
  const existing = getByPath(memory, sectionKey) || {};
  const newContent = `${existing.content || ''}\n\n${contentToAppend}`.trim();
  return await updateSection(ventureId, sectionKey, newContent, updatedBy);
}

module.exports = {
  updateSection,
  appendSection,
  getByPath,
  setByPath,
};
