const registry = require('../agents/index');
const router = require('../agents/router');
const AgentLog = require('../models/AgentLog');
const { buildFounderContextWindow } = require('./memoryService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function generateContextualFallbackReply(userMessage, ventureContext, agentName = 'FounderOS Co-Pilot AI') {
  const msg = (userMessage || '').trim();
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes('recognise') || lowerMsg.includes('recognize') || lowerMsg.includes('hear me') || lowerMsg.includes('understand')) {
    return `Yes! I recognize your words clearly: "${msg}". I am your FounderOS AI Coach. What specific goal would you like to focus on for your startup today?`;
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('greetings')) {
    return `Hello! Welcome to FounderOS. I'm ready to help you validate your idea, scope your MVP, or plan your launch strategy. What's on your mind?`;
  }

  if (lowerMsg.includes('founder') || lowerMsg.includes('startup') || lowerMsg.includes('building') || lowerMsg.includes('idea') || lowerMsg.includes('making')) {
    return `Building a startup around "${msg}" is an exciting journey! To make rapid progress, our first step is defining your core target user and value proposition. Who is your primary target customer?`;
  }

  if (lowerMsg.includes('mvp') || lowerMsg.includes('build') || lowerMsg.includes('product') || lowerMsg.includes('feature')) {
    return `Great focus on product development! For your MVP concept ("${msg}"), what is the single most essential feature your early adopters will use first?`;
  }

  if (lowerMsg.includes('marketing') || lowerMsg.includes('customer') || lowerMsg.includes('growth') || lowerMsg.includes('sale')) {
    return `Acquiring early users for "${msg}" is critical! Which primary channel do you plan to test first — direct outreach, organic content, or paid search?`;
  }

  if (lowerMsg.includes('investor') || lowerMsg.includes('pitch') || lowerMsg.includes('raise') || lowerMsg.includes('fund')) {
    return `Investors love seeing clear problem-solution fit and early momentum! For "${msg}", what key metrics or traction highlights do you want to feature in your update?`;
  }

  return `I hear you regarding "${msg}". As your startup co-pilot, I'm analyzing your venture parameters. What specific area (MVP, marketing, roadmap, or launch) shall we work on next?`;
}

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
  let routing = { primaryAgent: 'idea_validator', secondaryAgents: [], reasoning: 'Default routing' };
  try {
    routing = await router.routeMessage({
      userMessage,
      ventureContext,
      history,
    });
  } catch (rErr) {
    console.warn('Routing fallback:', rErr.message);
  }

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
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const { buildPrompt } = require('../prompts/buildPrompt');
          const genAI = new GoogleGenerativeAI(apiKey.trim());
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          const synthesisPrompt = buildPrompt({
            role: 'Master AI Synthesizer',
            objective: 'Combine specialized advice from multiple AI domain agents into ONE coherent response.',
            agentInstructions: `
PRIMARY AGENT (${primaryAgent.name}) ADVICE:
${primaryResult}

SECONDARY AGENTS ADVICE:
${validSecondaryResults.map((s) => `[${s.name}]: ${s.result}`).join('\n\n')}

Do NOT mention multiple agents. Present a unified response.
`.trim(),
            ventureContext,
            userInput: userMessage,
          });

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
    console.warn('Multi-agent execution warning:', error.message || error);
    finalReply = generateContextualFallbackReply(userMessage, ventureContext, primaryAgent.name);
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
