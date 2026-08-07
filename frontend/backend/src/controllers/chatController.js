const { validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const { generateChatReply } = require('../services/aiService');

/**
 * @desc    Send message to AI assistant and receive contextual response
 * @route   POST /api/chat/message
 * @access  Private (Owner only)
 */
const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { workspace = 'General', message } = req.body;
    const venture = req.venture;

    // Find existing Chat for this owner & venture, or create one
    let chat = await Chat.findOne({ owner: req.user.id, venture: venture._id });
    if (!chat) {
      chat = new Chat({
        owner: req.user.id,
        venture: venture._id,
        conversation: [],
      });
    }

    // 1. Add User Message
    const userMsg = {
      role: 'user',
      content: message,
      workspace,
      timestamp: new Date(),
    };
    chat.conversation.push(userMsg);

    // 2. Generate AI Assistant Reply using Unified 4-Layer AI Pipeline
    const { processAIRequest } = require('../services/aiOrchestrator');
    let replyContent = '';
    try {
      const orchResult = await processAIRequest({
        userId: req.user.id,
        ventureId: venture._id.toString(),
        agentName: 'ai_chat',
        userInput: message,
        history: chat.conversation,
      });
      replyContent = orchResult.response;
    } catch (err) {
      console.error('[Chat Controller Error] Failed to generate AI reply via pipeline:', err.message);
      return res.status(500).json({
        success: false,
        message: `AI Chat Error: ${err.message || 'Failed to process AI chat message'}`,
      });
    }

    // 3. Add Assistant Response
    const assistantMsg = {
      role: 'assistant',
      content: replyContent,
      workspace,
      timestamp: new Date(),
    };
    chat.conversation.push(assistantMsg);

    await chat.save();

    res.status(200).json({
      success: true,
      conversationId: chat._id.toString(),
      reply: replyContent,
      message: {
        role: assistantMsg.role,
        content: assistantMsg.content,
        workspace: assistantMsg.workspace,
        timestamp: assistantMsg.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI conversation history for a venture ordered by timestamp
 * @route   GET /api/chat/:ventureId
 * @access  Private (Owner only)
 */
const getConversation = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ owner: req.user.id, venture: req.venture._id });

    const conversation = chat
      ? chat.conversation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      : [];

    res.status(200).json({
      success: true,
      conversationId: chat ? chat._id.toString() : null,
      count: conversation.length,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Clear conversation history for a specific venture only
 * @route   DELETE /api/chat/:ventureId
 * @access  Private (Owner only)
 */
const deleteConversation = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ owner: req.user.id, venture: req.venture._id });

    if (chat) {
      chat.conversation = [];
      await chat.save();
    }

    res.status(200).json({
      success: true,
      message: 'Conversation history cleared for this venture',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  deleteConversation,
};
