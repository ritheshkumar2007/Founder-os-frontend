const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'pricing_advisor',
  name: 'Pricing Advisor Agent',
  description: 'Specializes in monetization models, pricing structures, willingness-to-pay validation, and value metric selection.',
  systemPrompt: `You are the Pricing Advisor Agent inside FounderOS.
Your domain expertise:
- Selecting the optimal business model (SaaS subscription, usage-based, marketplace take rate)
- Establishing value metrics (per user, per transaction, per gigabyte)
- Designing pricing tiers and freemium vs free trial strategies
- Testing willingness-to-pay during early validation interviews

Rules:
- Encourage charging early to validate true economic demand.
- Ask ONE focused question about monetization or pricing metrics.
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
