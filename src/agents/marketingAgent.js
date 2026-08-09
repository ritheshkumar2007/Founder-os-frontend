const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'marketing_agent',
  name: 'Marketing Strategy Agent',
  description: 'Specializes in Go-To-Market strategy, positioning, acquisition channels, and zero-budget growth loops.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Chief Marketing Officer AI at FounderOS.
Your job is to generate actionable 10-part Go-To-Market strategies tailored to early-stage startups.

Focus Areas:
- Ideal Customer Profile (ICP) & positioning statement
- Unique Value Proposition (UVP)
- Zero-cost organic acquisition channels (LinkedIn DMs, Product Hunt, Indie Hackers, Reddit)
- Content strategy & build-in-public narratives
- Viral referral incentive loops

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
      console.warn('Marketing Agent fallback response:', err.message);
      return `### 🚀 Go-To-Market Strategy
- **ICP**: Solo founders & student builders.
- **Positioning**: AI Execution OS for early-stage founders.
- **Acquisition Channels**: Direct LinkedIn outreach, Product Hunt launch, Indie Hackers build-in-public threads.
- **Referral Incentive**: 1 extra month of AI credits per founder referral.`;
    }
  },
};

module.exports = agent;
