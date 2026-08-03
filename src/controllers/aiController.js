const { chatWithGemini } = require('../services/geminiService');

/**
 * @desc    Send message to Gemini AI and get startup coaching response
 * @route   POST /api/ai/chat
 * @access  Private (requires JWT)
 */
const aiChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY.',
      });
    }

    const aiResponse = await chatWithGemini(history, message.trim());

    return res.status(200).json({
      success: true,
      reply: aiResponse,
    });
  } catch (error) {
    console.error('AI chat error:', error);

    // Friendly error for quota issues
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'AI service is temporarily busy. Please try again in a moment.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'AI service encountered an error. Please try again.',
    });
  }
};

module.exports = { aiChat };
