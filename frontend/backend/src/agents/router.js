const { GoogleGenerativeAI } = require('@google/generative-ai');
const registry = require('./index');

/**
 * Intelligent Agent Router
 * Analyzes the user's message against registered agent domain definitions
 * and returns primary and secondary agents along with reasoning.
 */
async function routeMessage({ userMessage, ventureContext, history = [] }) {
  const msg = (userMessage || '').trim();
  const lowerMsg = msg.toLowerCase();

  // Fast intent classification rules before calling Gemini router LLM
  if (
    lowerMsg.includes('understand') ||
    lowerMsg.includes('hello') ||
    lowerMsg.includes('hi') ||
    lowerMsg.includes('hey') ||
    lowerMsg.includes('who are you') ||
    lowerMsg.includes('what can you do') ||
    lowerMsg.includes('language') ||
    lowerMsg.includes('how are you') ||
    msg.length < 15
  ) {
    return {
      primaryAgent: 'ai_chat',
      secondaryAgents: [],
      reasoning: 'Routed to AI Chat Agent for conversational interaction.',
    };
  }

  if (lowerMsg.includes('validate') || lowerMsg.includes('interview') || lowerMsg.includes('assumption') || lowerMsg.includes('problem')) {
    return {
      primaryAgent: 'validation',
      secondaryAgents: [],
      reasoning: 'Routed to Validation Agent for startup idea & problem validation.',
    };
  }

  if (lowerMsg.includes('mvp') || lowerMsg.includes('scope') || lowerMsg.includes('feature') || lowerMsg.includes('build target')) {
    return {
      primaryAgent: 'mvp_scope',
      secondaryAgents: [],
      reasoning: 'Routed to MVP Scope Agent for feature scoping.',
    };
  }

  if (lowerMsg.includes('roadmap') || lowerMsg.includes('milestone') || lowerMsg.includes('timeline') || lowerMsg.includes('phase')) {
    return {
      primaryAgent: 'roadmap',
      secondaryAgents: [],
      reasoning: 'Routed to Technical Roadmap Agent for technical build timelines.',
    };
  }

  if (lowerMsg.includes('market') || lowerMsg.includes('gtm') || lowerMsg.includes('channel') || lowerMsg.includes('headline')) {
    return {
      primaryAgent: 'marketing_plan',
      secondaryAgents: [],
      reasoning: 'Routed to Marketing Plan Agent for GTM strategy.',
    };
  }

  if (lowerMsg.includes('launch') || lowerMsg.includes('product hunt') || lowerMsg.includes('sprint')) {
    return {
      primaryAgent: 'launch_sprint',
      secondaryAgents: [],
      reasoning: 'Routed to Launch Sprint Agent for launch execution.',
    };
  }

  if (lowerMsg.includes('traction') || lowerMsg.includes('metric') || lowerMsg.includes('revenue') || lowerMsg.includes('user')) {
    return {
      primaryAgent: 'traction',
      secondaryAgents: [],
      reasoning: 'Routed to Traction Analytics Agent for growth metrics.',
    };
  }

  if (lowerMsg.includes('investor') || lowerMsg.includes('deck') || lowerMsg.includes('pitch') || lowerMsg.includes('update')) {
    return {
      primaryAgent: 'investor_update',
      secondaryAgents: [],
      reasoning: 'Routed to Investor Update Agent for investor communications.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    // Default to general ai_chat if API key missing
    return {
      primaryAgent: 'ai_chat',
      secondaryAgents: [],
      reasoning: 'Default routing to AI Chat Agent.',
    };
  }

  const agentsSummary = registry.getAgentSummaryForRouter();

  const routerPrompt = `You are the Agent Router for FounderOS.
Analyze the user's message and select the most appropriate AI agent(s) from the registered list below.

REGISTERED AI AGENTS:
${agentsSummary}

STRICT SELECTION RULES:
1. "primaryAgent": Select the SINGLE best agent ID matching the user's main intent.
2. "secondaryAgents": If the message spans MULTIPLE domains, include secondary agent IDs. Otherwise, return [].
3. "reasoning": Provide a brief 1-sentence explanation of why you selected these agent(s).

USER MESSAGE: "${msg}"

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

    let primary = (data.primaryAgent || '').toLowerCase().trim();
    if (!registry.getAgent(primary)) {
      primary = 'ai_chat';
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
    console.error('[Agent Router Warning] Classification error, falling back to ai_chat:', error.message || error);
    return {
      primaryAgent: 'ai_chat',
      secondaryAgents: [],
      reasoning: 'Routed to AI Chat Agent fallback.',
    };
  }
}

module.exports = {
  routeMessage,
};
