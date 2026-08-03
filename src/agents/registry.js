/**
 * Pluggable AI Agent Registry
 * Allows new specialized AI agents to be added easily without modifying existing agent code.
 */

const agentsRegistry = new Map();

/**
 * Register a new specialized AI Agent in the system
 * @param {Object} agent
 * @param {string} agent.id - Unique ID (e.g. 'idea_validator')
 * @param {string} agent.name - Human readable display name
 * @param {string} agent.description - Specialization & domain coverage
 * @param {string} agent.systemPrompt - Specialized system prompt
 * @param {Function} agent.run - Execution function
 */
function registerAgent(agent) {
  if (!agent || !agent.id || typeof agent.id !== 'string') {
    throw new Error('Agent definition must include a unique string "id"');
  }

  if (!agent.name || !agent.systemPrompt) {
    throw new Error(`Agent "${agent.id}" must include "name" and "systemPrompt"`);
  }

  agentsRegistry.set(agent.id.toLowerCase().trim(), agent);
}

/**
 * Get an agent by ID
 */
function getAgent(id) {
  if (!id) return null;
  return agentsRegistry.get(String(id).toLowerCase().trim()) || null;
}

/**
 * Get list of all registered agents
 */
function getAllAgents() {
  return Array.from(agentsRegistry.values());
}

/**
 * Get summary of registered agents formatted for Gemini router prompt
 */
function getAgentSummaryForRouter() {
  const agents = getAllAgents();
  return agents
    .map((a) => `- ID: "${a.id}" | Name: "${a.name}" | Domain: ${a.description}`)
    .join('\n');
}

module.exports = {
  registerAgent,
  getAgent,
  getAllAgents,
  getAgentSummaryForRouter,
};
