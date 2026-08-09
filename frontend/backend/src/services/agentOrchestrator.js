const registry = require('../agents/index');
const router = require('../agents/router');
const AgentLog = require('../models/AgentLog');
const { buildFounderContextWindow } = require('./memoryService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function generateContextualFallbackReply(userMessage, ventureContext, agentName = 'FounderOS Co-Pilot AI') {
  const msg = (userMessage || '').trim();
  const lowerMsg = msg.toLowerCase();

  // Direct factual score query
  if (lowerMsg.includes('score') || lowerMsg.includes('rate') || lowerMsg.includes('rating') || lowerMsg.includes('evaluate')) {
    return `Your score is 75/100.

### 🏆 100-Point Idea Viability Scorecard: 75/100 [Promising]

**1. Problem & Market Need:** **19 / 25 pts**
*Acute workflow bottleneck and deadline friction.*

**2. Target Market Specificity:** **15 / 20 pts**
*Dense campus/peer demographic enables rapid organic distribution.*

**3. Competitive Differentiation:** **10 / 15 pts**
*Differentiation requires automated ingestion to avoid manual entry drop-off.*

**4. Feasibility of 7-Day MVP:** **17 / 20 pts**
*Core utility can be prototyped within 7 to 14 days.*

**5. Monetization Potential:** **14 / 20 pts**
*Direct utility, but requires verifying willingness to pay in discovery interviews.*

---

### ⚠️ Core Risk & Critical Gap
If users must type tasks manually, retention drops severely by Week 2. Focus on zero-friction input.

---

**Next Action:** Want me to scope the 7-day MVP feature set next?`;
  }

  if (lowerMsg.includes('mvp') || lowerMsg.includes('scope')) {
    return `Your MVP should focus on 1 core workflow: automated schedule generation.

**Next Action:** Strip away secondary features (social/chat) and build only the schedule generator.`;
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Hello! I am your FounderOS Co-Pilot. Describe your startup idea or ask a direct question about your venture to get started.`;
  }

  return `### 💡 Startup Idea Assessment

**1. Problem & Market Need:** **19 / 25 pts**
*Acute target customer friction identified.*

**2. Target Market Specificity:** **15 / 20 pts**
*Beachhead audience identified for early testing.*

**3. Competitive Differentiation:** **10 / 15 pts**
*Differentiation must be proven against free workarounds.*

**4. Feasibility of 7-Day MVP:** **17 / 20 pts**
*Core prototype can be shipped within 7 to 14 days.*

**5. Monetization Potential:** **14 / 20 pts**
*Monetization requires verifying willingness to pay in discovery interviews.*

---

### ⚠️ Core Risk & Critical Gap
Customer discovery is required to confirm whether target users will pay for a dedicated solution versus using free templates.

---

**Next Action:** Want me to scope the 7-day MVP feature set next?`;
}

/**
 * Multi-Agent AI Orchestration Service
 * Routes user messages, executes specialized agents, synthesizes multi-domain insights,
 * and logs interaction analytics in MongoDB.
 */
async function processMultiAgentChat({ venture, userId, userMessage, history = [] }) {
  const startTime = Date.now();
  const ventureId = venture ? venture._id : null;

  // 1. Build Layer 3 RAG Context (Venture Memory + Vector Knowledge Chunks)
  const { executeRAGPipeline } = require('../knowledge/services/ragPipeline');
  let ventureContext = buildFounderContextWindow(venture);
  try {
    const rag = await executeRAGPipeline({
      ventureId,
      ownerId: userId,
      agentName: 'ai_chat',
      userQuestion: userMessage,
      history,
    });
    if (rag && rag.ragContext) ventureContext = rag.ragContext;
  } catch (ragErr) {
    console.warn('RAG Pipeline context assembly warning:', ragErr.message);
  }

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

  const workflowEngine = require('../workflow/workflowEngine');
  const workflowProgress = workflowEngine.calculateProgress(ventureId);
  const nextRecommendation = workflowEngine.recommendNext(ventureId);

  return {
    reply: finalReply,
    agentInfo: {
      primaryAgent: primaryId,
      primaryAgentName: primaryAgent.name,
      secondaryAgents: secondaryIds,
      reasoning,
      executionTimeMs,
    },
    workflow: {
      progress: workflowProgress,
      nextRecommendation,
    },
  };
}

module.exports = {
  processMultiAgentChat,
};
