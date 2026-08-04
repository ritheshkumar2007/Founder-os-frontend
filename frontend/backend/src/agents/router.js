const { GoogleGenerativeAI } = require('@google/generative-ai');
const registry = require('./index');

/**
 * Intelligent Agent Router
 * Analyzes the user's message against registered agent domain definitions
 * and returns primary and secondary agents along with reasoning.
 */
async function routeMessage({ userMessage, ventureContext, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    // Fallback to default idea_validator if API key missing
    return {
      primaryAgent: 'idea_validator',
      secondaryAgents: [],
      reasoning: 'Fallback routing due to unconfigured API key.',
    };
  }

  const agentsSummary = registry.getAgentSummaryForRouter();

  const routerPrompt = `You are the Agent Router for FounderOS.
Analyze the user's message and select the most appropriate AI agent(s) from the registered list below.

REGISTERED AI AGENTS:
${agentsSummary}

STRICT SELECTION RULES:
1. "primaryAgent": Select the SINGLE best agent ID matching the user's main intent.
2. "secondaryAgents": If the message spans MULTIPLE domains (e.g. pricing AND MVP scope), include secondary agent IDs. Otherwise, return an empty array [].
3. "reasoning": Provide a brief 1-sentence explanation of why you selected these agent(s).

USER MESSAGE: "${userMessage}"

Return valid JSON ONLY in this EXACT structure:
{
  "primaryAgent": "string (registered agent id)",
  "secondaryAgents": ["string"],
  "reasoning": "string"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(routerPrompt);
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJsonText);

    // Validate selected primaryAgent exists in registry
    let primary = (data.primaryAgent || '').toLowerCase().trim();
    if (!registry.getAgent(primary)) {
      primary = 'idea_validator';
    }

    const secondaries = Array.isArray(data.secondaryAgents)
      ? data.secondaryAgents
          .map((s) => String(s).toLowerCase().trim())
          .filter((s) => s !== primary && Boolean(registry.getAgent(s)))
      : [];

    return {
      primaryAgent: primary,
      secondaryAgents: secondaries,
      reasoning: data.reasoning || `Routed to ${primary} based on user message analysis.`,
    };
  } catch (error) {
    console.error('Agent Router error:', error.message || error);
    return {
      primaryAgent: 'idea_validator',
      secondaryAgents: [],
      reasoning: 'Routed to default Idea Validator due to router classification fallback.',
    };
  }
}

module.exports = {
  routeMessage,
};
