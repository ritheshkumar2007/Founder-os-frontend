const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'mvp_planner',
  name: 'MVP Planner Agent',
  description: 'Specializes in 2-week MVP feature scoping, product requirements, build vs cut decisions, and early product promises.',
  systemPrompt: `You are the MVP Planner Agent inside FounderOS.
Your domain expertise:
- Scoping ultra-focused 2-week MVPs
- Cutting secondary features (analytics, complex permissions, polish) before launch
- Defining the single core job the MVP must fulfill
- Aligning product features with validated customer pain points

Rules:
- Be aggressive about cutting non-essential features.
- Ask ONE focused question helping the founder trim unnecessary feature bloat.
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
