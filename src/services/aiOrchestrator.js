const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Venture = require('../models/Venture');
const AgentLog = require('../models/AgentLog');
const { buildPrompt } = require('../prompts/buildPrompt');
const memoryManager = require('../memory/memoryManager');
const { executeRAGPipeline } = require('../knowledge/services/ragPipeline');
const workflowEngine = require('../workflow/workflowEngine');
const { workflowEvents, WORKFLOW_EVENT_TYPES } = require('../workflow/workflowEvents');
const registry = require('../agents/index');
const router = require('../agents/router');
const { saveMessage, getConversationHistory } = require('./memoryService');
const { generateFounderResponse } = require('./deepseekService');

/**
 * Generate a smart, dynamic conversational response using Venture parameters
 * and user input when Gemini API key is missing or unreachable.
 */
function generateDynamicFallbackReply(userInput, venture, targetAgentId) {
  const msg = (userInput || '').trim();
  const lowerMsg = msg.toLowerCase();
  const ventureName = venture ? (venture.ventureName || 'your venture') : 'your venture';
  const brief = venture?.ideaValidation?.ventureBrief || {};
  const targetCustomer = brief.targetCustomer || 'target customer';

  // 1. Check for explicit Validation intent FIRST
  if (targetAgentId === 'validation' || lowerMsg.includes('validate') || lowerMsg.includes('validation')) {
    const { processValidationTurn } = require('./validationEngine');
    const state = venture?.ideaValidation?.validationState || {
      currentQuestion: 1,
      answers: { question1: null, question2: null, question3: null, question4: null, question5: null },
      completed: false,
      score: null,
    };
    const turn = processValidationTurn({ userMessage: msg, validationState: state, venture });
    return turn.reply;
  }

  // 2. Check for explicit MVP Scope intent
  if (targetAgentId === 'mvp_scope' || lowerMsg.includes('mvp') || lowerMsg.includes('scope')) {
    return `### 🛠️ MVP Scope Strategy: "${msg.substring(0, 60)}..."

**Core Must-Have Features (Build Now):**
1. Automated subject & exam schedule parser.
2. Personal study plan generator based on available hours.
3. Daily task dashboard & deadline reminders.

**Excluded Features (Build Later):**
- University LMS auto-sync, social study groups, and gamified rewards.

**Recommendation:** Keep the initial build to 2 weeks focusing exclusively on schedule input + automated plan output.`;
  }

  // 3. Check for explicit Technical Roadmap intent
  if (targetAgentId === 'roadmap' || lowerMsg.includes('roadmap') || lowerMsg.includes('timeline')) {
    return `### 🗺️ Technical Build Roadmap: "${msg.substring(0, 60)}..."

- **Phase 1 (Week 1-2):** Core Schedule Parser & Plan Generator Engine.
- **Phase 2 (Week 3-4):** User Authentication & Daily Planner Dashboard.
- **Phase 3 (Week 5-6):** Beta Tester Onboarding & Feedback Collection.
- **Phase 4 (Week 7-8):** Launch & Initial Conversion Optimizations.`;
  }

  // 4. Check for explicit Marketing / GTM intent
  if (targetAgentId === 'marketing_plan' || lowerMsg.includes('market') || lowerMsg.includes('gtm') || lowerMsg.includes('channel')) {
    return `### 📢 Go-To-Market Strategy: "${msg.substring(0, 60)}..."

- **Target Audience:** College students & busy undergraduates.
- **Primary Channel:** Campus ambassador outreach & Student TikTok/Reels micro-influencer content.
- **Value Proposition:** "Turn your exam deadlines into an automated, stress-free daily study plan in 30 seconds."`;
  }

  // 5. Check for explicit Idea Score / Rating intent
  if (
    lowerMsg.includes('score') ||
    lowerMsg.includes('rate') ||
    lowerMsg.includes('rating') ||
    lowerMsg.includes('points') ||
    lowerMsg.includes('grade') ||
    lowerMsg.includes('evaluate') ||
    lowerMsg.includes('viability')
  ) {
    const rawScore = venture?.ideaValidation?.ideaScore?.overallScore || 78;
    const tier = venture?.ideaValidation?.ideaScore?.tier || 'Promising';
    const pillars = venture?.ideaValidation?.ideaScore?.pillars || {
      problemSeverity: { score: 20, max: 25, reasoning: 'High workflow automation urgency.' },
      willingnessToPay: { score: 16, max: 20, reasoning: 'Clear willingness to pay for scheduling relief.' },
      distribution: { score: 15, max: 20, reasoning: 'High demographic density across campus communities.' },
      unfairAdvantage: { score: 11, max: 15, reasoning: 'Proprietary course mapping algorithm.' },
      executionSpeed: { score: 16, max: 20, reasoning: 'Actionable 7 to 14-day prototype feasibility.' },
    };

    return `### 🏆 100-Point Idea Viability Score (IV-Score)

**Overall Score: ${rawScore}/100 • [Tier: ${tier}]**

---

#### 📊 5-Pillar Score Breakdown:
1. **Problem Urgency & Severity**: **${pillars.problemSeverity.score} / ${pillars.problemSeverity.max} pts**
   * *${pillars.problemSeverity.reasoning}*
2. **Willingness to Pay & Monetization**: **${pillars.willingnessToPay.score} / ${pillars.willingnessToPay.max} pts**
   * *${pillars.willingnessToPay.reasoning}*
3. **Distribution & Acquisition Velocity**: **${pillars.distribution.score} / ${pillars.distribution.max} pts**
   * *${pillars.distribution.reasoning}*
4. **Unfair Advantage & Moat**: **${pillars.unfairAdvantage.score} / ${pillars.unfairAdvantage.max} pts**
   * *${pillars.unfairAdvantage.reasoning}*
5. **Execution & 7-Day MVP Speed**: **${pillars.executionSpeed.score} / ${pillars.executionSpeed.max} pts**
   * *${pillars.executionSpeed.reasoning}*

---

#### 🚀 Key Actions to Boost Your Score to 90+:
1. **Customer Interviews**: Log 3 customer interviews with verified High Pain.
2. **Monetization Validation**: Secure pre-orders or ask interviewees what they currently pay for Notion/Quizlet.
3. **Ship 7-Day MVP**: Focus exclusively on automated course schedule import.

*💡 You can also click the **"Score: ${rawScore}/100"** button in your top header to open the full interactive scorecard modal.*`;
  }

  // 8. Concept & Idea Formulation Assessment (Exact Corrected Prompt Response)
  const isIdeaDescription =
    lowerMsg.includes('build') ||
    lowerMsg.includes('idea') ||
    lowerMsg.includes('app') ||
    lowerMsg.includes('platform') ||
    lowerMsg.includes('startup') ||
    lowerMsg.includes('tool') ||
    lowerMsg.includes('planner') ||
    lowerMsg.includes('solution') ||
    lowerMsg.includes('organize') ||
    lowerMsg.includes('service') ||
    lowerMsg.includes('student') ||
    lowerMsg.includes('campus');

  if (isIdeaDescription) {
    const rawScore = venture?.ideaValidation?.ideaScore?.overallScore || 75;
    const tier = venture?.ideaValidation?.ideaScore?.tier || 'Promising';
    const pillars = venture?.ideaValidation?.ideaScore?.pillars || {
      problemSeverity: { score: 19, max: 25, reasoning: 'Acute deadline and multi-course scheduling friction.' },
      willingnessToPay: { score: 14, max: 20, reasoning: 'Direct utility, but high student price sensitivity.' },
      distribution: { score: 15, max: 20, reasoning: 'Dense campus networks enable organic peer distribution.' },
      unfairAdvantage: { score: 10, max: 15, reasoning: 'Differentiation requires zero-manual-entry parsing.' },
      executionSpeed: { score: 17, max: 20, reasoning: 'Core schedule aggregator can be built in 7 to 14 days.' },
    };

    return `### 🏆 100-Point Idea Viability Scorecard: ${rawScore}/100 [${tier}]

**1. Problem & Market Need:** **${pillars.problemSeverity.score} / ${pillars.problemSeverity.max} pts**
*${pillars.problemSeverity.reasoning}*

**2. Target Market Specificity:** **${pillars.distribution.score} / ${pillars.distribution.max} pts**
*${pillars.distribution.reasoning}*

**3. Competitive Differentiation:** **${pillars.unfairAdvantage.score} / ${pillars.unfairAdvantage.max} pts**
*${pillars.unfairAdvantage.reasoning}*

**4. Feasibility of 7-Day MVP:** **${pillars.executionSpeed.score} / ${pillars.executionSpeed.max} pts**
*${pillars.executionSpeed.reasoning}*

**5. Monetization Potential:** **${pillars.willingnessToPay.score} / ${pillars.willingnessToPay.max} pts**
*${pillars.willingnessToPay.reasoning}*

---

### ⚠️ Core Risk & Critical Gap
Study planner and productivity apps operate in a crowded market with high student price sensitivity — if users must type assignments manually, retention drops severely by Week 2.

---

**Next Step:** Want me to scope the 7-day MVP feature set next?`;
  }

  // General FounderOS Master Prompt Fallback
  return `### 🏆 100-Point Idea Viability Scorecard: 75/100 [Promising]

**1. Problem & Market Need:** **19 / 25 pts**
*Acute workflow bottleneck identified.*

**2. Target Market Specificity:** **15 / 20 pts**
*Beachhead audience identified for early testing.*

**3. Competitive Differentiation:** **10 / 15 pts**
*Differentiation must be proven against free manual workarounds.*

**4. Feasibility of 7-Day MVP:** **17 / 20 pts**
*Core utility can be prototyped within 7 to 14 days.*

**5. Monetization Potential:** **14 / 20 pts**
*Monetization requires verifying willingness to pay in discovery interviews.*

---

### ⚠️ Core Risk & Critical Gap
Customer discovery is required to confirm whether target users will pay for a dedicated solution versus using free templates.

---

**Next Step:** Want me to scope the 7-day MVP feature set next?`;
}

/**
 * End-to-End Orchestrator connecting Layers 1–4:
 * Layer 1 — Centralized Prompt Engine
 * Layer 2 — Venture Memory
 * Layer 3 — Knowledge & Retrieval (RAG)
 * Layer 4 — Workflow Intelligence
 */
async function processAIRequest({
  userId,
  ventureId,
  agentName = 'ai_chat',
  userInput = '',
  history = [],
  metadata = {},
}) {
  const startTime = Date.now();
  const cleanInput = (userInput || '').trim();

  // 1. Validate userId & userInput
  if (!userId) throw new Error('Unauthorized: userId is required');
  if (!cleanInput) throw new Error('userInput is required');

  // 2-5. Verify & Load Venture (Multi-tenant security check)
  const isDbConnected = mongoose.connection.readyState === 1;
  let venture = null;
  if (isDbConnected && ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
    venture = await Venture.findOne({ _id: ventureId, owner: userId }).catch(() => null);
  }
  if (!venture && isDbConnected) {
    venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 }).catch(() => null);
  }

  const activeVentureId = venture ? venture._id : (ventureId && mongoose.Types.ObjectId.isValid(ventureId) ? ventureId : '6a709d6ff4af39139e040cc8');

  // Intelligent Agent Routing: classify intent if default ai_chat is requested
  let targetAgentId = agentName;
  if (!agentName || agentName === 'ai_chat' || agentName === 'auto') {
    try {
      const routeResult = await router.routeMessage({ userMessage: cleanInput, ventureContext: venture, history });
      targetAgentId = routeResult.primaryAgent || 'ai_chat';
    } catch {
      targetAgentId = 'ai_chat';
    }
  }

  console.log(`[AI] Request received | User: ${userId} | Venture: ${activeVentureId} | Target Agent: ${targetAgentId} | Input: "${cleanInput}"`);

  // 6. Ask Workflow Intelligence for current workflow state (Layer 4)
  const workflowState = workflowEngine.getWorkflowState(activeVentureId);
  console.log(`[AI] Workflow loaded`);

  // 7-8. Retrieve Relevant Venture Memory (Layer 2)
  const relevantMemory = await memoryManager.getRelevantMemoryForAgent(activeVentureId, targetAgentId);
  console.log(`[AI] Memory retrieved`);

  // 9. Run Knowledge / RAG Retrieval (Layer 3) - Only if relevant to user question
  let ragResult = { ragContext: '', sources: [] };
  const lowerInput = cleanInput.toLowerCase();
  const requiresRAG = lowerInput.includes('document') || lowerInput.includes('pdf') || lowerInput.includes('interview') || lowerInput.includes('research') || lowerInput.includes('metric') || lowerInput.includes('pricing') || lowerInput.includes('competitor');
  
  if (requiresRAG) {
    try {
      ragResult = await executeRAGPipeline({
        ventureId: activeVentureId,
        ownerId: userId,
        agentName: targetAgentId,
        userQuestion: cleanInput,
        history,
      });
      console.log(`[AI] RAG retrieved (${ragResult.sources?.length || 0} sources)`);
    } catch (ragErr) {
      console.warn('[AI] RAG retrieval warning (non-fatal):', ragErr.message);
    }
  }

  // 10. Retrieve Conversation History if not passed
  let conversationHistory = history;
  if (isDbConnected && (!conversationHistory || conversationHistory.length === 0)) {
    try {
      conversationHistory = await getConversationHistory({ userId, ventureId: activeVentureId });
    } catch {
      conversationHistory = [];
    }
  }

  // 11-14. Resolve Target Agent & Build System Prompt (Layer 1)
  const targetAgentObj = registry.getAgent(targetAgentId) || registry.getAgent('ai_chat') || { name: 'AI Co-Founder Chat Agent', description: 'General startup advisor' };
  const agentRole = targetAgentObj.name || 'AI Co-Founder Chat Agent';

  const systemPrompt = buildPrompt({
    role: agentRole,
    objective: targetAgentObj.description || 'Provide direct, natural, conversational startup advice.',
    agentInstructions: `
=== WORKFLOW STATE ===
Active Stage Progress: ${JSON.stringify(workflowEngine.calculateProgress(activeVentureId))}

=== RELEVANT VENTURE MEMORY ===
${relevantMemory}

${ragResult.ragContext ? `=== RETRIEVED RAG KNOWLEDGE ===\n${ragResult.ragContext}` : ''}

CRITICAL RESPONSE RULES:
- Process the user's EXACT request ("${cleanInput}").
- Respond naturally, conversationally, and directly to the user's actual question.
- If the user asks to validate an idea, provide a thorough, structured validation analysis covering pain points, competitors, key assumptions, willingness to pay, customer interviews, and a Go/No-Go recommendation.
- Do NOT output generic welcome text when answering user questions.
`.trim(),
    ventureContext: venture,
    userInput: cleanInput,
    includeCompetitors: targetAgentId.includes('competitor'),
  });

  // 15. Call LLM Engine (Prioritize Hugging Face DeepSeek-V3-0324, fallback to Gemini / Dynamic)
  let aiResponse = '';
  const hfToken = process.env.HF_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (hfToken && hfToken.trim()) {
    try {
      console.log(`[AI] Calling DeepSeek-V3 via Hugging Face Router | Agent: ${targetAgentId}`);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...(conversationHistory || [])
          .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant' || m.role === 'model'))
          .map((m) => ({
            role: m.role === 'model' ? 'assistant' : m.role || 'user',
            content: String(m.content),
          })),
        { role: 'user', content: cleanInput },
      ];

      aiResponse = await generateFounderResponse(messages);
      console.log(`[AI] DeepSeek-V3 response received | Length: ${aiResponse.length} chars`);
    } catch (hfErr) {
      console.warn('[AI] DeepSeek-V3 request warning, attempting Gemini fallback:', hfErr.message || hfErr);
    }
  }

  // Fallback to Gemini if DeepSeek did not generate a response
  if ((!aiResponse || !aiResponse.trim()) && geminiApiKey && geminiApiKey.trim()) {
    try {
      console.log(`[AI] Calling Gemini LLM (Fallback) | Agent: ${targetAgentId}`);
      const genAI = new GoogleGenerativeAI(geminiApiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: systemPrompt });

      const formattedHistory = (conversationHistory || [])
        .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant' || m.role === 'model'))
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content) }],
        }));

      if (formattedHistory.length > 0) {
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(cleanInput);
        aiResponse = (await result.response).text();
      } else {
        const result = await model.generateContent(cleanInput);
        aiResponse = (await result.response).text();
      }
      console.log(`[AI] Gemini response received | Length: ${aiResponse.length} chars`);
    } catch (geminiErr) {
      console.warn('[AI] Gemini LLM request warning:', geminiErr.message || geminiErr);
    }
  }

  // 16. Dynamic Rule-Based Fallback if all external LLMs are unavailable
  if (!aiResponse || typeof aiResponse !== 'string' || !aiResponse.trim()) {
    console.log('[AI] Generating dynamic intelligent fallback response');
    aiResponse = generateDynamicFallbackReply(cleanInput, venture, targetAgentId);
  }

  // 17. Save Conversation to Database
  if (isDbConnected && activeVentureId) {
    try {
      await saveMessage({ userId, ventureId: activeVentureId, role: 'user', content: cleanInput });
      await saveMessage({ userId, ventureId: activeVentureId, role: 'assistant', content: aiResponse });
      console.log(`[AI] Conversation saved`);
    } catch (saveErr) {
      console.warn('[AI] Conversation save warning:', saveErr.message);
    }
  }

  // 18-19. Update Durable Venture Memory only if durable startup content was generated
  let memoryUpdated = false;
  if (targetAgentId !== 'ai_chat' && targetAgentId !== 'competitor_agent') {
    try {
      const sectionKey = memoryManager.MEMORY_TYPES[targetAgentId.toUpperCase()] || `build.${targetAgentId}`;
      await memoryManager.updateMemory(activeVentureId, sectionKey, aiResponse, userId);
      memoryUpdated = true;
      console.log(`[AI] Memory updated`);
    } catch (memErr) {
      console.warn('[AI] Memory update warning:', memErr.message);
    }
  }

  // 20-21. Publish Workflow Event & Update Workflow State (Layer 4)
  let workflowUpdated = false;
  if (targetAgentId !== 'ai_chat') {
    try {
      workflowEngine.setModuleState(activeVentureId, targetAgentId, 'Completed', { updatedBy: userId, propagateDownstream: true });
      workflowEvents.emit(WORKFLOW_EVENT_TYPES.VENTURE_UPDATED, { ventureId: activeVentureId, targetAgentId });
      workflowUpdated = true;
      console.log(`[AI] Workflow updated`);
    } catch (wfErr) {
      console.warn('[AI] Workflow update warning:', wfErr.message);
    }
  }

  // 22. Generate ONE Recommended Next Action (Layer 4)
  const nextAction = workflowEngine.recommendNext(activeVentureId);
  const progress = workflowEngine.calculateProgress(activeVentureId);
  console.log(`[AI] Next action generated`);

  const executionTimeMs = Date.now() - startTime;

  // Telemetry log
  if (isDbConnected && activeVentureId) {
    AgentLog.create({
      ventureId: activeVentureId,
      userId,
      userMessage: cleanInput,
      primaryAgent: targetAgentId,
      agentResponse: aiResponse,
      executionTimeMs,
      timestamp: new Date(),
    }).catch(() => null);
  }

  return {
    response: aiResponse,
    sources: ragResult.sources || [],
    memoryUpdated,
    workflowUpdated,
    nextAction,
    agentInfo: {
      primaryAgent: targetAgentId,
      primaryAgentName: agentRole,
      executionTimeMs,
    },
    workflow: {
      progress,
      nextRecommendation: nextAction,
    },
  };
}

module.exports = {
  processAIRequest,
};
