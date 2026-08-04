const { getVentureMemory } = require('./memoryService');
const { getByPath } = require('./memoryUpdater');

/**
 * Domain-specific relevance mapping
 */
const AGENT_RELEVANCE_MAP = {
  competitor_analysis: ['profile', 'ideaValidation.ventureBrief', 'ideaValidation.validationResults', 'growth.marketingPlan'],
  competitor_agent: ['profile', 'ideaValidation.ventureBrief', 'ideaValidation.validationResults', 'growth.marketingPlan'],
  validation: ['profile', 'ideaValidation.ventureBrief', 'ideaValidation.customerPainPoints', 'ideaValidation.assumptions'],
  validation_agent: ['profile', 'ideaValidation.ventureBrief', 'ideaValidation.customerPainPoints', 'ideaValidation.assumptions'],
  mvp_scope: ['profile', 'ideaValidation.ventureBrief', 'ideaValidation.customerPainPoints', 'ideaValidation.validationResults', 'build.mvpScope'],
  mvp_agent: ['profile', 'ideaValidation.ventureBrief', 'ideaValidation.customerPainPoints', 'ideaValidation.validationResults', 'build.mvpScope'],
  roadmap: ['profile', 'ideaValidation.ventureBrief', 'build.mvpScope', 'build.roadmap'],
  roadmap_agent: ['profile', 'ideaValidation.ventureBrief', 'build.mvpScope', 'build.roadmap'],
  marketing_plan: ['profile', 'ideaValidation.ventureBrief', 'growth.marketingPlan', 'growth.tractionMetrics'],
  marketing_agent: ['profile', 'ideaValidation.ventureBrief', 'growth.marketingPlan', 'growth.tractionMetrics'],
  launch_sprint: ['profile', 'build.mvpScope', 'build.roadmap', 'build.launchPlan'],
  launch_agent: ['profile', 'build.mvpScope', 'build.roadmap', 'build.launchPlan'],
  traction: ['profile', 'build.roadmap', 'growth.tractionMetrics'],
  traction_agent: ['profile', 'build.roadmap', 'growth.tractionMetrics'],
  investor_update: ['profile', 'build.roadmap', 'growth.marketingPlan', 'growth.tractionMetrics', 'growth.investorUpdates'],
  investor_agent: ['profile', 'build.roadmap', 'growth.marketingPlan', 'growth.tractionMetrics', 'growth.investorUpdates'],
};

/**
 * Retrieve selectively formatted memory for a specific AI agent
 */
async function getRelevantMemoryForAgent(ventureId, agentName = '') {
  if (!ventureId) return 'No previous venture memory found.';

  const memory = await getVentureMemory(ventureId);
  if (!memory) return 'No previous venture memory found.';

  const normalizedAgent = String(agentName).toLowerCase().trim().replace(/[-\s]/g, '_');
  const relevantPaths = AGENT_RELEVANCE_MAP[normalizedAgent] || [
    'profile',
    'ideaValidation.ventureBrief',
    'build.mvpScope',
    'build.roadmap',
    'growth.marketingPlan',
    'growth.tractionMetrics',
  ];

  const sectionsOutput = [];

  // Always include Profile
  if (memory.profile) {
    sectionsOutput.push(
      `Venture Name: ${memory.profile.name || 'Unnamed Venture'}\nIndustry: ${memory.profile.industry || 'Not Specified'}\nStage: ${memory.profile.stage || 'Idea'}\nTarget Customer: ${memory.profile.targetCustomer || 'Not Specified'}`
    );
  }

  for (const path of relevantPaths) {
    if (path === 'profile') continue; // already formatted
    const data = getByPath(memory, path);
    const sectionName = path.split('.').pop();
    if (data && (data.content || data.summary)) {
      const text = data.summary || data.content;
      sectionsOutput.push(`[Previous ${sectionName} Memory]:\n${text}`);
    } else {
      sectionsOutput.push(`[Previous ${sectionName} Memory]:\nNo previous ${sectionName} data found.`);
    }
  }

  return sectionsOutput.join('\n\n');
}

module.exports = {
  AGENT_RELEVANCE_MAP,
  getRelevantMemoryForAgent,
};
