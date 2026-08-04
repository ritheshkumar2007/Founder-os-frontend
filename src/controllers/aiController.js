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
    const userId = req.user.id;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
      });
    }

    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.',
      });
    }

    // 1. Load Venture Information
    let venture = null;
    if (ventureId) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    const activeVentureId = venture ? venture._id : ventureId;

    // 2. Save User Message to Memory
    if (activeVentureId) {
      await saveMessage({
        userId,
        ventureId: activeVentureId,
        role: 'user',
        content: message.trim(),
      });
    }

    // 3. Retrieve Chronological Conversation History
    let conversationHistory = [];
    if (activeVentureId) {
      conversationHistory = await getConversationHistory({
        userId,
        ventureId: activeVentureId,
      });
    }

    // 4. Process Message via Multi-Agent AI System (Router, Specialized Agents & Synthesis)
    const agentResult = await processMultiAgentChat({
      venture,
      userId,
      userMessage: message.trim(),
      history: conversationHistory,
    });

    const aiResponse = agentResult.reply;
    const agentInfo = agentResult.agentInfo;

    // 5. Save Assistant Response to Memory
    if (activeVentureId) {
      await saveMessage({
        userId,
        ventureId: activeVentureId,
        role: 'assistant',
        content: aiResponse,
      });
    }

    // 6. Update Venture Memory, Validation Report, Coach Recommendations & Executive Reports
    let validationReport = null;
    let coachRecommendations = null;
    let reports = [];

    if (venture && activeVentureId) {
      // Update Venture Memory parameters if new information revealed
      await updateVentureMemory({
        venture,
        userMessage: message.trim(),
        assistantReply: aiResponse,
      });

      // Run AI Startup Validation Engine
      const reportData = await evaluateStartupValidation({
        venture,
        history: conversationHistory,
        userMessage: message.trim(),
        assistantReply: aiResponse,
      });

      // Save/Upsert versioned ValidationReport in MongoDB
      validationReport = await upsertValidationReport({
        ventureId: activeVentureId,
        userId,
        reportData,
      });

      // Run AI Founder Coach Engine
      const coachData = await evaluateCoachRecommendations({
        venture,
        history: conversationHistory,
        validationReport,
        userMessage: message.trim(),
        assistantReply: aiResponse,
      });

      // Save/Upsert Coach Recommendations in MongoDB
      coachRecommendations = await upsertCoachRecommendations({
        ventureId: activeVentureId,
        userId,
        coachData,
      });

      // Run AI Reports Engine to generate all 7 executive consulting reports
      reports = await generateAllReportsForVenture({
        venture,
        userId,
        history: conversationHistory,
      });

      // Automatically convert AI Coach recommendations & Validation next actions into Kanban tasks
      await createTasksFromRecommendations({
        ventureId: activeVentureId,
        userId,
        recommendations: coachRecommendations?.recommendations || [],
        nextActions: validationReport?.recommendations?.top5NextActions || [],
      });
    }

    // Fallback lookups & execution progress retrieval
    if (!validationReport && activeVentureId) {
      validationReport = await getLatestReport(activeVentureId);
    }
    if (!coachRecommendations && activeVentureId) {
      coachRecommendations = await getCoachDashboardData({ ventureId: activeVentureId, userId });
    }
    if ((!reports || reports.length === 0) && activeVentureId) {
      reports = await getAllVentureReports(activeVentureId);
    }

    let kanbanTasks = null;
    let pillarProgress = null;
    let growth = null;
    if (activeVentureId) {
      kanbanTasks = await getTasksForVenture(activeVentureId);
      pillarProgress = await calculatePillarProgress(activeVentureId);
      growth = await getLatestGrowthData(activeVentureId);
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

    const statusCode = error.statusCode || error.status || 500;

    if (statusCode === 429 || error.message?.includes('429')) {
      return res.status(429).json({
        success: false,
        message: 'AI service is temporarily busy due to rate limits. Please try again in a moment.',
      });
    }

    if (statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Bad request to AI service.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'AI service encountered an error. Please try again.',
    });
  }
};

module.exports = { aiChat };






