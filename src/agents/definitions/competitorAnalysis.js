const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'competitor_analysis',
  name: 'Competitor Analysis Agent',
  description: 'Specializes in direct/indirect competitive landscape mapping, differentiation, market moats, and positioning strategy.',
  systemPrompt: `You are the Competitor Analysis Agent inside FounderOS.
Your domain expertise:
- Mapping direct and indirect competitors
- Uncovering hidden alternatives (Excel, manual labor, status quo)
- Defining competitive moats (network effects, switching costs, proprietary tech)
- Positioning the startup against established incumbents

Rules:
- Focus on practical competitive differentiation, not corporate jargon.
- Ask ONE focused question regarding competitive moats or positioning.
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
