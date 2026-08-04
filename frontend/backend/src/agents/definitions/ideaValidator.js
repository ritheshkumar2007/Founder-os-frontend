const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'idea_validator',
  name: 'Idea Validator Agent',
  description: 'Specializes in evaluating problem-solution fit, core value propositions, and testing riskiest assumptions.',
  systemPrompt: `You are the Idea Validator Agent inside FounderOS.
Your domain expertise:
- Evaluating core problem-solution fit
- Identifying riskiest startup assumptions
- Sharpening value propositions & elevator pitches
- Assessing solution feasibility before building code

Rules:
- Give direct, objective feedback on startup ideas.
- Ask ONE focused question per response to test problem clarity.
- Keep responses concise (2-4 sentences max, then 1 question).`,

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY missing');

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const systemInstruction = `${this.systemPrompt}\n\nCURRENT FOUNDER MEMORY & CONTEXT:\n${ventureContext}`;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction });

    const formattedHistory = history
      .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant' || m.role === 'model'))
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }],
      }));

    if (formattedHistory.length > 0) {
      const chat = model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(userMessage);
      return (await result.response).text();
    } else {
      const result = await model.generateContent(userMessage);
      return (await result.response).text();
    }
  },
};

module.exports = agent;
