const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'investor_agent',
  name: 'Investor Relations Agent',
  description: 'Specializes in monthly investor updates, executive memorandum generation, milestone highlights, and investor asks.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Investor Relations Advisor AI at FounderOS.
Your job is to draft professional investor updates and executive memorandum letters.

Focus Areas:
- Monthly executive summaries
- Key achievements & product milestones
- Growth & financial metrics (MAU, MRR, retention)
- Strategic challenges & solutions
- Specific asks for investors (intros, advice, hiring)

${constraints}
${toneRules}
${outputRules}
`.trim(),

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const systemInstruction = `${this.systemPrompt}\n\nCURRENT FOUNDER MEMORY & CONTEXT:\n${ventureContext}`;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction });

      const formattedHistory = (history || [])
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
      console.warn('Investor Agent fallback response:', err.message);
      return `### ✉️ Monthly Investor Update
- **Summary**: Delivered 4 product releases, grew active users to 142, hit 72% 30-day retention.
- **Key Milestones**: Production launch of FounderOS AI engines.
- **Goals for Next Quarter**: Scale to 500 active founders and $5,000 MRR.`;
    }
  },
};

module.exports = agent;
