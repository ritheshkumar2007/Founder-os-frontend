const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildFounderContextWindow } = require('./memoryService');

/**
 * Core AI Service for communicating with Google Gemini API
 * 
 * @param {Object} options
 * @param {string} options.message - Current user message
 * @param {Object} [options.venture] - Venture document from DB
 * @param {Array} [options.history] - Array of previous { role, content } messages from DB
 * @returns {Promise<string>} Gemini response text
 */
async function chatWithGemini(options) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    const error = new Error('GEMINI_API_KEY is not set in environment variables');
    error.statusCode = 500;
    throw error;
  }

  let userMessage = '';
  let rawHistory = [];
  let venture = null;

  if (typeof options === 'string') {
    userMessage = options;
  } else if (typeof options === 'object' && options !== null) {
    userMessage = options.message || '';
    rawHistory = options.history || [];
    venture = options.venture || null;
  }

  if (!userMessage || !userMessage.trim()) {
    const error = new Error('User message is required');
    error.statusCode = 400;
    throw error;
  }

  const memoryContext = buildFounderContextWindow(venture);

  const systemInstruction = `You are an experienced startup advisor and business mentor embedded inside FounderOS — an AI-powered startup operating system.

You possess persistent, long-term Founder Memory. You must ALWAYS remember and reason about the founder's active startup background parameters.

CURRENT FOUNDER MEMORY & VENTURE PARAMETERS:
${memoryContext}

Your personality:
- Warm, encouraging, but direct and honest (wisdom of a seasoned YC-style mentor)
- You remember everything the founder tells you about their startup
- You ask ONE focused question at a time — never multiple questions at once
- You build directly on what the founder says — never repeat yourself
- You are conversational, practical, and highly specific

Rules:
- ALWAYS ask only ONE question per response
- Keep responses concise (2-4 sentences max, then one question)
- Refer to their specific product, customer, problem, and solution when relevant`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    // Build conversation history for Gemini
    const history = rawHistory
      .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant' || m.role === 'model') && m.id !== 'initial-ai-greeting')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }],
      }));

    if (history.length > 0) {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage.trim());
      const response = await result.response;
      return response.text();
    } else {
      const result = await model.generateContent(userMessage.trim());
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error('Gemini API error in aiService:', error.message || error);
    throw error;
  }
}

module.exports = {
  chatWithGemini,
  generateGeminiReply: chatWithGemini,
};



