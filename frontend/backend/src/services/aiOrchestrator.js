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
- Respond naturally, conversationally, and directly to the user's actual question.
- Do NOT turn general conversational questions (e.g. "do you understand my language") into structured Idea Validation tasks.
- Answer the user's question first, then offer relevant startup assistance.
`.trim(),
    ventureContext: venture,
    userInput: cleanInput,
    includeCompetitors: targetAgentId.includes('competitor'),
  });
  console.log(`[AI] Prompt built | Length: ${systemPrompt.length} chars`);

  // 15. Call LLM Engine (NO FAKE TEMPLATE FALLBACK MASKING)
  let aiResponse = '';
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';
  
  console.log(`[AI] Starting LLM request | Agent: ${targetAgentId} | Calling Gemini`);
  try {
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
    console.error('[AI ERROR] Gemini LLM Execution Failed:', llmErr.message || llmErr);
    // Explicit error throw - NO silent fake response template masking!
    throw new Error(`Gemini LLM Execution Failed: ${llmErr.message || 'API request error'}`);
  }

  // 16. Validate AI Response
  if (!aiResponse || typeof aiResponse !== 'string' || !aiResponse.trim()) {
    throw new Error('AI Service returned an empty or invalid response.');
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
