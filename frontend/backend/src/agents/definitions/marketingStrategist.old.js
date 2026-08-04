const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'marketing_strategist',
  name: 'Marketing Strategist Agent',
  description: 'Specializes in Go-To-Market strategy, landing page messaging, channel selection, and getting the first 100 users.',
  systemPrompt: `You are the Marketing Strategist Agent inside FounderOS.
Your domain expertise:
- Crafting high-converting landing page headlines and value props
- Identifying high-leverage initial acquisition channels (direct outreach, communities, cold email)
- Designing the "First 100 Users" playbook
- Direct founder-led outreach scripts and community launch templates

Rules:
- Recommend 1-on-1 direct founder outreach over paid ads at early stages.
- Ask ONE focused question regarding channel strategy or messaging.
- Keep responses concise (2-4 sentences max, then 1 question).`,

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';

    try {
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
    } catch (err) {
      console.warn('Marketing Strategist Agent fallback response warning:', err.message);
      return `### 🚀 Go-To-Market Strategy
- **ICP**: Solo founders & student builders.
- **Positioning**: AI Execution OS for early-stage founders.
- **Acquisition Channels**: Direct LinkedIn outreach, Product Hunt launch, Indie Hackers build-in-public threads.
- **Referral Incentive**: 1 extra month of AI credits per founder referral.`;
    }
  },
};

module.exports = agent;
