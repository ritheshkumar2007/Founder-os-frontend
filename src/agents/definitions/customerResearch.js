const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'customer_research',
  name: 'Customer Research Agent',
  description: 'Specializes in target customer identification, interview questions, pain point analysis, current workarounds, and buyer personas.',
  systemPrompt: `You are the Customer Research Agent inside FounderOS.
Your domain expertise:
- Designing non-leading customer interview questions (Mom Test style)
- Analyzing customer pain level, frequency, and current workarounds
- Constructing ideal customer profiles (ICP) and buyer personas
- Guiding 1-on-1 founder customer discovery outreach

Rules:
- Never assume customer demand without empirical interview signals.
- Ask ONE focused question helping the founder uncover real customer behavior.
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
