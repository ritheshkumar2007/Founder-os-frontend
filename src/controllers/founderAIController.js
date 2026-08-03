const AIConversation = require('../models/AIConversation');
const Venture = require('../models/Venture');
const { chatWithFounderAI, aggregateStartupContext } = require('../services/founderGeminiService');

/**
 * Controller to handle POST /api/founder-ai/chat
 */
async function handleChat(req, res, next) {
  try {
    const userId = req.user.id;
    let { ventureId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    let venture = null;
    if (ventureId) {
      venture = await Venture.findOne({ _id: ventureId, owner: userId });
    }
    if (!venture) {
      venture = await Venture.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    ventureId = venture ? venture._id : undefined;

    // Retrieve or create AIConversation
    let conversation = null;
    if (ventureId) {
      conversation = await AIConversation.findOne({ ventureId, userId }).sort({ createdAt: -1 });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        userId,
        ventureId: ventureId || undefined,
        messages: [],
      });
    }

    // Call Gemini AI Co-Founder Service
    const aiResponseText = await chatWithFounderAI({
      userMessage: message.trim(),
      historyMessages: conversation.messages,
      ventureId,
      userId,
    });

    // Save user message and AI response to MongoDB
    conversation.messages.push({ role: 'user', content: message.trim(), timestamp: new Date() });
    conversation.messages.push({ role: 'assistant', content: aiResponseText, timestamp: new Date() });
    await conversation.save();

    const currentContext = await aggregateStartupContext(ventureId, userId);

    return res.status(200).json({
      success: true,
      reply: aiResponseText,
      conversation,
      context: currentContext,
    });
  } catch (error) {
    console.error('Error in founderAIController handleChat:', error);
    next(error);
  }
}

/**
 * Controller to handle GET /api/founder-ai/history
 */
async function getHistory(req, res, next) {
  try {
    const { ventureId } = req.query;
    const userId = req.user.id;

    let conversation = null;
    if (ventureId) {
      conversation = await AIConversation.findOne({ ventureId, userId }).sort({ createdAt: -1 });
    } else {
      conversation = await AIConversation.findOne({ userId }).sort({ createdAt: -1 });
    }

    const currentContext = await aggregateStartupContext(ventureId, userId);

    return res.status(200).json({
      success: true,
      conversation: conversation || { messages: [] },
      context: currentContext,
    });
  } catch (error) {
    console.error('Error in founderAIController getHistory:', error);
    next(error);
  }
}

module.exports = {
  handleChat,
  getHistory,
};
