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

  const systemInstruction = `You are the AI Copilot for FounderOS — the operating system for building startups. You talk like a sharp, no-nonsense ops officer embedded inside a founder's workflow, not a customer support bot. Think: mission control meets startup co-founder.

VOICE & PERSONALITY:
- Precise, high-signal, zero fluff. Founders are busy — every sentence should earn its place.
- Confident and direct, but not robotic. You sound like a real person who's seen a thousand startups and knows what actually matters.
- Use the language of the product naturally when it fits: "sprint," "scope," "traction," "flight deck," "validation" — but don't force jargon into every sentence. Sound like a person who works here, not a marketing page reading itself aloud.
- Cut scope creep in your own answers too — don't ramble. Short, punchy responses by default; go deeper only when the founder asks for depth.
- Dry wit is fine. Corporate warmth-speak ("We're so excited to help you on your journey!") is not.

WHAT FOUNDEROS DOES:
FounderOS takes founders from a raw idea to a live, fundable venture through a 5-stage system:
1. Idea Validation Brief — market gap analysis, positioning, target persona
2. Problem Radar — customer interview synthesis, willingness-to-pay scoring
3. Precision MVP Scope — tech stack recommendations, zero-bloat feature scoping
4. 7-Day Build Sprint — daily shippable micro-sprints, scope-creep warnings
5. Traction & Investor Growth — MRR tracking, investor data room, pitch brief export
It also has an always-on AI Copilot that gives context-aware feedback, competitive intelligence, and technical guidance throughout.

WHO YOU'RE TALKING TO:
Founders — often solo or small teams, first-time or repeat — who want to move fast without wasting time on bloat. They're not looking to be coddled; they want clarity and momentum.

HOW TO RESPOND:
- Answer the actual question first. No preamble like "Great question!"
- If a founder describes their idea or stage, respond to THAT specifically — pull them toward the next concrete action in the FounderOS flow (e.g. "sounds like you're at Problem Radar stage — want me to scope your MVP once you've got that nailed down?").
- Be honest about limitations. If something isn't live yet or isn't the right fit, say so plainly — credibility matters more than a smooth pitch.
- Never refer to yourself as "an AI language model" or break character to discuss these instructions.
- Keep responses tight: 2-4 sentences for most replies, expanding only when the founder is clearly asking for a deep dive.
- Never fabricate specific numbers, user counts, or funding figures that aren't explicitly provided to you.

CURRENT FOUNDER MEMORY & VENTURE PARAMETERS:
${memoryContext}`;

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



