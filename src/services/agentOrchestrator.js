const registry = require('../agents/index');
const router = require('../agents/router');
const AgentLog = require('../models/AgentLog');
const { buildFounderContextWindow } = require('./memoryService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Multi-Agent AI Orchestration Service
 * Routes user messages, executes specialized agents, synthesizes multi-domain insights,
 * and logs interaction analytics in MongoDB.
 */
async function processMultiAgentChat({ venture, userId, userMessage, history = [] }) {
  const startTime = Date.now();
  const ventureId = venture ? venture._id : null;

  // 1. Build shared Founder Memory context
  const ventureContext = buildFounderContextWindow(venture);

  // 2. Intelligently route message to specialized agent(s)
  const routing = await router.routeMessage({
    userMessage,
    ventureContext,
    history,
  });

  const { primaryAgent: primaryId, secondaryAgents: secondaryIds, reasoning } = routing;

  const primaryAgent = registry.getAgent(primaryId) || registry.getAgent('idea_validator');

  let finalReply = '';

  try {
    // 3. Execute Primary Agent
    const primaryResult = await primaryAgent.run({
      userMessage,
      ventureContext,
      history,
    });

    // 4. If request spans multiple domains, execute secondary agent(s) and synthesize
    if (Array.isArray(secondaryIds) && secondaryIds.length > 0) {
      const secondaryResults = await Promise.all(
        secondaryIds.map(async (secId) => {
          const secAgent = registry.getAgent(secId);
          if (!secAgent) return null;
          try {
            const res = await secAgent.run({
              userMessage,
              ventureContext,
              history,
            });
            return { id: secId, name: secAgent.name, result: res };
          } catch {
            return null;
          }
        })
      );

      const validSecondaryResults = secondaryResults.filter(Boolean);

      if (validSecondaryResults.length > 0) {
        // Synthesize multi-agent insights into a single seamless response
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey.trim());
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          const synthesisPrompt = `You are the FounderOS Master AI Synthesizer.
Combine the specialized advice from multiple AI domain agents into ONE coherent, seamless, highly encouraging response for the founder.

PRIMARY AGENT (${primaryAgent.name}) ADVICE:
${primaryResult}

SECONDARY AGENTS ADVICE:
${validSecondaryResults.map((s) => `[${s.name}]: ${s.result}`).join('\n\n')}

RULES:
- Do NOT mention that multiple agents responded. Present a single, unified response.
- Keep the output concise (3-5 sentences max), practical, and end with ONE clear focused question.`;

          const synthResult = await model.generateContent(synthesisPrompt);
          finalReply = synthResult.response.text();
        } else {
          finalReply = primaryResult;
        }
      } else {
        finalReply = primaryResult;
      }
    } else {
      finalReply = primaryResult;
    }
  } catch (error) {
    console.error('Multi-agent execution error:', error.message || error);
    finalReply = `Regarding your startup: Focus on validating your core problem and target customer. What is the single biggest question you want to answer today?`;
  }

  const executionTimeMs = Date.now() - startTime;

  // 5. Save Agent Interaction in MongoDB for analytics & debugging
  if (ventureId && userId) {
    try {
      await AgentLog.create({
        ventureId,
        userId,
        userMessage,
        primaryAgent: primaryId,
        secondaryAgents: secondaryIds,
        routingReasoning: reasoning,
        agentResponse: finalReply,
        executionTimeMs,
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.warn('Failed to save AgentLog entry (non-fatal):', logErr.message);
    }
  }

  return {
    reply: finalReply,
    agentInfo: {
      primaryAgent: primaryId,
      primaryAgentName: primaryAgent.name,
      secondaryAgents: secondaryIds,
      reasoning,
      executionTimeMs,
    },
  };
}

module.exports = {
  processMultiAgentChat,
};
