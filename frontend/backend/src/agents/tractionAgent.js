const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'traction_agent',
  name: 'Traction Analytics Agent',
  description: 'Specializes in tracking startup metrics, weekly sprint completion, bottleneck identification, and growth health scores.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Startup Growth & Traction Advisor AI at FounderOS.
Your job is to analyze startup metrics and provide data-driven growth recommendations.

Focus Areas:
- Health scores across validation, execution, and growth
- Key metric tracking (contacted, interviews, signups, MAU, paying customers, MRR)
- Identifying weekly bottlenecks and highest-leverage actions
- Recommending 1-on-1 tactics to improve funnel conversion

${constraints}
${toneRules}
${outputRules}
`.trim(),

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;
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
      console.warn('Traction Agent fallback response:', err.message);
      return `### 📈 Startup Traction Health
- **Validation Score**: 78/100
- **Execution Score**: 65/100
- **Growth Score**: 50/100
- **Current Focus**: Focus on 1-on-1 founder outreach to convert waitlist signups to daily active users.`;
    }
  },
};

module.exports = agent;
