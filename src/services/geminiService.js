const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an experienced startup advisor and business mentor embedded inside FounderOS — an AI-powered startup operating system.

Your personality:
- Warm, encouraging, but direct and honest
- You have the wisdom of a seasoned startup mentor (think Paul Graham, Y Combinator style)
- You ask ONE focused question at a time — never multiple questions at once
- You build on what the founder says — never repeat yourself
- You are conversational, not formal

Your goal:
- Help founders validate their startup idea through conversation
- Understand their: product idea, target customer, core pain point, current workarounds, value proposition, and MVP scope
- Guide the conversation naturally toward building a complete venture brief
- Give constructive feedback, suggestions, and encouragement along the way

Rules:
- ALWAYS ask only ONE question per response
- Keep responses concise (2-4 sentences max, then one question)
- Use simple, clear language — no jargon unless the founder uses it first
- Be encouraging but realistic
- If the founder seems stuck, give an example to help them think
- After 6-8 exchanges, you can offer to summarize what you've learned about their venture

Remember: You are inside a startup OS — founders come here to build real companies. Take their ideas seriously.`;

/**
 * Send a message to Gemini and get a response
 * @param {Array} messages - Array of {role: 'user'|'assistant', content: string}
 * @param {string} userMessage - The latest user message
 */
async function chatWithGemini(messages, userMessage) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build conversation history for Gemini
    const history = messages
      .filter((m) => m.role !== 'assistant' || m.id !== 'initial-ai-greeting')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Start chat session with history
    const chat = model.startChat({ history });

    // Send the new user message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

module.exports = { chatWithGemini };
