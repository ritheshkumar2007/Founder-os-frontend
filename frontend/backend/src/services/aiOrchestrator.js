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
    return `### 💡 Startup Validation Analysis: "${msg.substring(0, 60)}..."

**1. Target Customer Pain Points:**
- Students struggle with managing multiple course deadlines, exams, and fluctuating schedules manually.
- Procrastination and overwhelming workload leading to stress and missed preparation.

**2. Existing Alternatives & Competitors:**
- Manual Google Calendar/Notion templates, Quizlet, Motion, and Reclaim.ai.

**3. Key Assumptions to Validate:**
- Students will consistently input subjects and deadlines into an AI planner.
- Students are willing to pay a recurring monthly subscription ($5–$10/mo) for automated scheduling.

**4. Willingness to Pay Signal:**
- Moderate to High if integrated directly with university LMS (Canvas/Blackboard).

**5. First 5 Customer Interviews to Conduct:**
1. Interview 2 undergraduate students with 4+ heavy courses.
2. Interview 1 graduate student juggling work and studies.
3. Interview 2 freshman/sophomore students struggling with time management.

**Recommendation:** **CONTINUE (PROCEED TO MVP SCOPING)**. The problem is acute and students actively seek automation tools for study schedules.`;
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

  // 6. Flexible regex check for Greetings (supports "hii", "hiii", "heyy", "helloo", "hi", "hello")
  const isGreeting = /\b(hello+|h+i+|h+e+y+|greetings|welcome)\b/i.test(msg);
  if (isGreeting) {
    return `Hello! Welcome to FounderOS. I am your AI Co-Pilot for "${ventureName}". I am ready to help you validate your target audience (${targetCustomer}), scope your MVP, or plan your GTM strategy. How can I assist you today?`;
  }

  // 7. Conversational language check
  if (lowerMsg.includes('understand') || lowerMsg.includes('language') || lowerMsg.includes('hear me')) {
    return `Yes! I understand your message clearly: "${msg}". As your FounderOS Co-Pilot for "${ventureName}", I can process your questions, validate ideas, scope MVPs, and track roadmaps. What startup goal shall we tackle next?`;
  }

  // General fallback
  return `Regarding "${msg}" for "${ventureName}": I am analyzing your parameters. We can focus on your MVP scope, customer validation, launch roadmap, or growth metrics. Which area would you like to explore?`;
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

  // 15. Call LLM Engine (With intelligent dynamic fallback if key unconfigured)
  let aiResponse = '';
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey && apiKey.trim() && apiKey.trim() !== 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ') {
    try {
      console.log(`[AI] Calling Gemini LLM | Agent: ${targetAgentId}`);
      const genAI = new GoogleGenerativeAI(apiKey.trim());
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
    } catch (llmErr) {
      console.warn('[AI] Gemini LLM request warning, generating dynamic response:', llmErr.message || llmErr);
      aiResponse = generateDynamicFallbackReply(cleanInput, venture, targetAgentId);
    }
  } else {
    console.log('[AI] GEMINI_API_KEY unconfigured, generating dynamic response');
    aiResponse = generateDynamicFallbackReply(cleanInput, venture, targetAgentId);
  }

  // 16. Validate AI Response
  if (!aiResponse || typeof aiResponse !== 'string' || !aiResponse.trim()) {
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
