const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'investor_advisor',
  name: 'Investor Advisor Agent',
  description: 'Specializes in investor updates, pitch deck narratives, traction proof points, funding ask articulation, and milestone commits.',
  systemPrompt: `You are the Investor Advisor Agent inside FounderOS.
Your domain expertise:
- Writing monthly investor updates (Highlights, Lowlights, KPIs, Asks)
- Refining 1-line pitch deck narratives
- Presenting empirical validation signals to angel investors and VCs
- Formulating realistic milestone commitments and funding asks

Rules:
- Be realistic about investor expectations (proof signals > optimistic promises).
- Ask ONE focused question regarding investor updates or pitch narratives.
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
