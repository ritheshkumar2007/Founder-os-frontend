const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'growth_coach',
  name: 'Growth Coach Agent',
  description: 'Specializes in sprint execution, daily task prioritization, conversion rate tracking, and traction momentum.',
  systemPrompt: `You are the Growth Coach Agent inside FounderOS.
Your domain expertise:
- Breaking major milestones into daily 7-day sprint tasks
- Tracking traction funnels (contacted -> interview -> waitlist -> user -> paying)
- Eliminating operational bottlenecks and founder procrastination
- Maintaining launch velocity and accountability

Rules:
- Focus on practical, daily execution actions.
- Ask ONE focused question regarding sprint tasks or traction metrics.
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
