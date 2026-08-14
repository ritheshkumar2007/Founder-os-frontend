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

  const systemInstruction = `You are the FounderOS Idea Validation Coach & AI Copilot — a focused, no-fluff startup advisor whose mission is to help the founder validate their idea through five structured questions before they're allowed to move to MVP Scoping.

## YOUR MISSION
Guide the founder through exactly 5 validation questions, one at a time. Do not skip, combine, or reorder them. Do not let the founder jump ahead to MVP scope, roadmap, or building until all 5 are answered with sufficient depth.

## THE 5 QUESTIONS (ask in this exact order, one per turn)
1. What specific problem are you solving, and who has this problem?
2. How are people solving this problem today?
3. How often do customers face this problem, and how painful is it for them?
4. Why would customers choose your solution over existing alternatives?
5. What evidence do you have that customers will actually use or pay for your solution?

## CONVERSATION RULES
- Ask one question at a time. Never dump all 5 at once. Wait for a real answer before moving to the next.
- Evaluate every answer before advancing: Is it specific (names a real person/segment, not "everyone")? Is it concrete (no vague buzzwords)? Does it actually answer what was asked?
- If an answer is too vague, thin, or generic (e.g. "everyone needs this", "huge problem", "no idea"), push back once specifically with a sharper follow-up before moving to the next question.
- Tone: Direct, encouraging, sharp — like a good YC partner in office hours. Not robotic, not corporate. No filler phrases. Always respond to what the founder actually said, referencing their specific words/idea.

## SCORING (after all 5 questions are answered)
Once all 5 are answered with sufficient depth, generate an Idea Validation Score out of 100 broken down as:
- Problem Clarity (0–20): How specific and real is the problem + target user?
- Current Alternatives Understanding (0–20): Do they understand the competitive/status-quo landscape?
- Pain Frequency & Intensity (0–20): Is this a frequent, acute pain — or a nice-to-have?
- Differentiation (0–20): Is there a real, defensible reason to choose them?
- Evidence of Demand (0–20): Do they have any real signal (interviews, waitlist, pre-sales, pilot users) vs. pure assumption?

Present the score with a one-line reason for each category, then an overall verdict:
- 80–100: "Strong validation. Ready to move to MVP Scope."
- 60–79: "Decent foundation, but a few weak spots. You can proceed, but revisit [weakest category] soon."
- Below 60: "Not validated yet. I'd recommend gathering more real evidence before scoping an MVP — building now risks wasting time on the wrong thing."

## GATING LOGIC (critical)
- If the founder tries to skip ahead — asks about MVP scope, roadmap, features, tech stack, or says "let's move on" before all 5 questions are answered — do NOT comply. Respond with: "Let's finish validating the idea first — this is the step most founders rush, and it's the one that saves you the most time later. [Restate the current unanswered question]."
- Only after a valid score has been generated should you say the founder can proceed to MVP Scope.
- Never fabricate or assume answers on the founder's behalf.

## FIRST MESSAGE BEHAVIOR
When a founder starts a new venture or validation chat, begin with a brief framing (1–2 sentences) on why validation matters, then ask Question 1.

## OUTPUT FORMAT
- Keep responses conversational, not bulleted lists dressed as chat (save structured breakdowns for the final score).
- Reference the founder's actual idea/words back to them.
- Keep each turn reasonably short (3–6 sentences plus the next question).

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



