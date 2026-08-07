const mongoose = require('mongoose');
const { processMultiAgentChat } = require('../services/agentOrchestrator');
const { saveMessage, getConversationHistory, updateVentureMemory } = require('../services/memoryService');
const { evaluateStartupValidation } = require('../services/validationService');
const { upsertValidationReport, getLatestReport } = require('../services/reportService');
const { evaluateCoachRecommendations, upsertCoachRecommendations, getCoachDashboardData } = require('../services/coachService');
const { generateAllReportsForVenture, getAllVentureReports } = require('../services/reportService');
const { createTasksFromRecommendations, getTasksForVenture } = require('../services/taskService');
const { calculatePillarProgress } = require('../services/progressService');
const { getLatestGrowthData } = require('../services/growthService');
const Venture = require('../models/Venture');

/**
 * @desc    Send message to Gemini Multi-Agent AI System with Founder Memory, Validation Engine, AI Coach & Reports Engine
 * @route   POST /api/ai/chat
 * @access  Private (requires JWT authentication)
 */
const aiChat = async (req, res, next) => {
  try {
    const { ventureId, message } = req.body;
    const userId = req.user ? req.user.id : 'unknown';

    console.log(`🤖 [AI Endpoint Request] Route: POST /api/ai/chat | User: ${userId} | VentureId: ${ventureId || 'N/A'}`);
    console.log(`🤖 [AI Endpoint Payload] Body:`, JSON.stringify(req.body));

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Load Venture Information safely with ObjectId check
    let venture = null;
    if (isDbConnected) {
      if (ventureId && mongoose.Types.ObjectId.isValid(ventureId)) {
        venture = await Venture.findOne({ _id: ventureId, owner: userId }).catch(() => null);
      }
      if (!venture) {
        venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 }).catch(() => null);
      }
    }

    const activeVentureId = venture ? venture._id : (ventureId && mongoose.Types.ObjectId.isValid(ventureId) ? ventureId : undefined);

    // 2. Save User Message to Memory
    if (isDbConnected && activeVentureId) {
      try {
        await saveMessage({
          userId,
          ventureId: activeVentureId,
          role: 'user',
          content: message.trim(),
        });
      } catch (err) {
        console.warn('Memory save user message warning:', err.message);
      }
    }

    // 3. Retrieve Chronological Conversation History
    let conversationHistory = [];
    if (isDbConnected && activeVentureId) {
      try {
        conversationHistory = await getConversationHistory({
          userId,
          ventureId: activeVentureId,
        });
      } catch (err) {
        console.warn('Get history warning:', err.message);
      }
    }

    // 4. Process Message via Unified 4-Layer AI Pipeline
    const { processAIRequest } = require('../services/aiOrchestrator');
    let agentResult = { response: 'I am analyzing your startup context. What is your top priority right now?', agentInfo: { primaryAgent: 'idea_validator', primaryAgentName: 'Idea Validator AI' } };
    try {
      agentResult = await processAIRequest({
        userId,
        ventureId: activeVentureId,
        agentName: 'ai_chat',
        userInput: message.trim(),
        history: conversationHistory,
      });
    } catch (agentErr) {
      console.warn('Agent processing warning:', agentErr.message);
    }

    const aiResponse = agentResult.response || agentResult.reply || 'What specific area of your venture would you like to explore next?';
    const agentInfo = agentResult.agentInfo;

    // 5. Save Assistant Response to Memory
    if (activeVentureId) {
      try {
        await saveMessage({
          userId,
          ventureId: activeVentureId,
          role: 'assistant',
          content: aiResponse,
        });
      } catch (err) {
        console.warn('Memory save assistant message warning:', err.message);
      }
    }

    // 6. Update Venture Memory, Validation Report, Coach Recommendations & Executive Reports
    let validationReport = null;
    let coachRecommendations = null;
    let reports = [];

    if (venture && activeVentureId) {
      try {
        await updateVentureMemory({
          venture,
          userMessage: message.trim(),
          assistantReply: aiResponse,
        });
      } catch (err) {
        console.warn('Update venture memory warning:', err.message);
      }

      try {
        const reportData = await evaluateStartupValidation({
          venture,
          history: conversationHistory,
          userMessage: message.trim(),
          assistantReply: aiResponse,
        });
        validationReport = await upsertValidationReport({
          ventureId: activeVentureId,
          userId,
          reportData,
        });
      } catch (err) {
        console.warn('Validation evaluation warning:', err.message);
      }

      try {
        const coachData = await evaluateCoachRecommendations({
          venture,
          history: conversationHistory,
          validationReport,
          userMessage: message.trim(),
          assistantReply: aiResponse,
        });
        coachRecommendations = await upsertCoachRecommendations({
          ventureId: activeVentureId,
          userId,
          coachData,
        });
      } catch (err) {
        console.warn('Coach evaluation warning:', err.message);
      }

      try {
        reports = await generateAllReportsForVenture({
          venture,
          userId,
          history: conversationHistory,
        });
      } catch (err) {
        console.warn('Reports generation warning:', err.message);
      }

      try {
        await createTasksFromRecommendations({
          ventureId: activeVentureId,
          userId,
          recommendations: coachRecommendations?.recommendations || [],
          nextActions: validationReport?.recommendations?.top5NextActions || [],
        });
      } catch (err) {
        console.warn('Tasks generation warning:', err.message);
      }
    }

    // Fallback lookups & execution progress retrieval
    if (!validationReport && activeVentureId) {
      try { validationReport = await getLatestReport(activeVentureId); } catch (e) {}
    }
    if (!coachRecommendations && activeVentureId) {
      try { coachRecommendations = await getCoachDashboardData({ ventureId: activeVentureId, userId }); } catch (e) {}
    }
    if ((!reports || reports.length === 0) && activeVentureId) {
      try { reports = await getAllVentureReports(activeVentureId); } catch (e) {}
    }

    let kanbanTasks = null;
    let pillarProgress = null;
    let growth = null;
    if (activeVentureId) {
      try { kanbanTasks = await getTasksForVenture(activeVentureId); } catch (e) {}
      try { pillarProgress = await calculatePillarProgress(activeVentureId); } catch (e) {}
      try { growth = await getLatestGrowthData(activeVentureId); } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      reply: aiResponse,
      agentInfo,
      validationReport,
      coachRecommendations,
      reports,
      kanbanTasks,
      pillarProgress,
      growth,
    });
  } catch (error) {
    console.error('AI chat controller error:', error);

    return res.status(200).json({
      success: true,
      reply: "I am analyzing your venture context. What is the main priority you'd like to work on today?",
      agentInfo: {
        primaryAgent: "idea_validator",
        primaryAgentName: "FounderOS Co-Pilot AI",
        secondaryAgents: [],
        reasoning: "Resilient fallback mode engaged.",
        executionTimeMs: 10,
      },
      validationReport: null,
      coachRecommendations: null,
      reports: [],
    });
  }
};

module.exports = { aiChat };






