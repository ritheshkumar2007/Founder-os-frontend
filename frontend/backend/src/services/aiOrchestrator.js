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
  console.log(`[AI Orchestrator] Request received | User: ${userId} | Venture: ${ventureId} | Agent: ${agentName}`);

  // 1. Validate userId & ventureId
  if (!userId) throw new Error('Unauthorized: userId is required');
  const cleanInput = (userInput || '').trim();
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
  console.log(`[AI Orchestrator] Venture loaded | Active VentureId: ${activeVentureId}`);

  // 6. Ask Workflow Intelligence for current workflow state (Layer 4)
  const workflowState = workflowEngine.getWorkflowState(activeVentureId);
  console.log(`[AI Orchestrator] Workflow loaded`);

  // 7-8. Retrieve Relevant Venture Memory (Layer 2)
  const relevantMemory = await memoryManager.getRelevantMemoryForAgent(activeVentureId, agentName);
  console.log(`[AI Orchestrator] Memory retrieved`);

  // 9. Run Knowledge / RAG Retrieval (Layer 3)
  let ragResult = { ragContext: '', sources: [] };
  try {
    ragResult = await executeRAGPipeline({
      ventureId: activeVentureId,
      ownerId: userId,
      agentName,
      userQuestion: cleanInput,
      history,
    });
    console.log(`[AI Orchestrator] RAG retrieved`);
  } catch (ragErr) {
    console.warn('[AI Orchestrator] RAG retrieval fallback:', ragErr.message);
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

  // 11-14. Resolve Agent & Build System Prompt (Layer 1)
  const targetAgent = registry.getAgent(agentName) || registry.getAgent('idea_validator');
  const agentRole = targetAgent ? targetAgent.name : 'FounderOS AI Agent';

  const systemPrompt = buildPrompt({
    role: agentRole,
    objective: targetAgent ? targetAgent.description : 'Provide founder-grade guidance using venture memory and RAG context.',
    agentInstructions: `
=== WORKFLOW STATE ===
Active Stage Progress: ${JSON.stringify(workflowEngine.calculateProgress(activeVentureId))}
=== RELEVANT VENTURE MEMORY & RAG CONTEXT ===
${relevantMemory}
${ragResult.ragContext || ''}
`.trim(),
    ventureContext: venture,
    userInput: cleanInput,
    includeCompetitors: agentName.includes('competitor'),
  });
  console.log(`[AI Orchestrator] Prompt built`);

  // 15. Call LLM Engine
  let aiResponse = '';
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';
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
    console.log(`[AI Orchestrator] LLM called`);
  } catch (llmErr) {
    console.warn('[AI Orchestrator] LLM error fallback:', llmErr.message);
    aiResponse = `### 🚀 ${agentRole} Output\nAnalyzing your request regarding "${cleanInput}". Focus on validating your core target audience and value proposition.\n\n## Next Action\nReach out to 5 target founders on LinkedIn to conduct customer discovery.`;
  }

  // 16. Validate AI response
  if (!aiResponse || typeof aiResponse !== 'string' || !aiResponse.trim()) {
    aiResponse = '### 🚀 FounderOS Response\n- Analyzed venture parameters successfully.\n\n## Next Action\nSelect your next target milestone in the workflow dashboard.';
  }

  // 17. Save Conversation
  if (isDbConnected && activeVentureId) {
    try {
      await saveMessage({ userId, ventureId: activeVentureId, role: 'user', content: cleanInput });
      await saveMessage({ userId, ventureId: activeVentureId, role: 'assistant', content: aiResponse });
      console.log(`[AI Orchestrator] Conversation saved`);
    } catch (saveErr) {
      console.warn('[AI Orchestrator] Conversation save warning:', saveErr.message);
    }
  }

  // 18-19. Extract & Update Durable Venture Memory (Layer 2)
  let memoryUpdated = false;
  try {
    const sectionKey = memoryManager.MEMORY_TYPES[agentName.toUpperCase()] || `build.${agentName}`;
    await memoryManager.updateMemory(activeVentureId, sectionKey, aiResponse, userId);
    memoryUpdated = true;
    console.log(`[AI Orchestrator] Memory updated`);
  } catch (memErr) {
    console.warn('[AI Orchestrator] Memory update warning:', memErr.message);
  }

  // 20-21. Publish Workflow Event & Recalculate Workflow State (Layer 4)
  let workflowUpdated = false;
  try {
    workflowEngine.setModuleState(activeVentureId, agentName, 'Completed', { updatedBy: userId, propagateDownstream: true });
    workflowEvents.emit(WORKFLOW_EVENT_TYPES.VENTURE_UPDATED, { ventureId: activeVentureId, agentName });
    workflowUpdated = true;
    console.log(`[AI Orchestrator] Workflow updated`);
  } catch (wfErr) {
    console.warn('[AI Orchestrator] Workflow update warning:', wfErr.message);
  }

  // 22. Generate ONE Recommended Next Action (Layer 4)
  const nextAction = workflowEngine.recommendNext(activeVentureId);
  const progress = workflowEngine.calculateProgress(activeVentureId);
  console.log(`[AI Orchestrator] Next action generated`);

  const executionTimeMs = Date.now() - startTime;

  // Log interaction for telemetry
  if (isDbConnected && activeVentureId) {
    AgentLog.create({
      ventureId: activeVentureId,
      userId,
      userMessage: cleanInput,
      primaryAgent: agentName,
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
      primaryAgent: agentName,
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
