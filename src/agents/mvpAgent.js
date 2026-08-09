const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'mvp_agent',
  name: 'MVP Scope Agent',
  description: 'Specializes in scoping 2-week minimal viable products, isolating must-have features, and delaying unnecessary complexity.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Chief Product Officer AI at FounderOS.
Your job is to scope realistic, 2-week MVPs that deliver maximum value with minimum code.

Focus Areas:
- Defining the MVP promise ("Help X achieve Y without Z")
- Must-have features vs excluded features (Build Now vs Build Later)
- Scoping two-week build targets
- Preventing scope creep and over-engineering

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
      console.warn('MVP Agent fallback response:', err.message);
      return `### 📦 MVP Scope Blueprint
- **Core Promise**: Help solo founders validate and scope MVPs in under 2 weeks.
- **Build Now**: Single-prompt AI generator, exportable markdown reports, MongoDB storage.
- **Build Later**: Multi-user permissions, paid subscription billing, mobile apps.`;
    }
  },
};

module.exports = agent;
