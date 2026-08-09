const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'launch_agent',
  name: 'Launch Sprint Agent',
  description: 'Specializes in product launch execution, Product Hunt campaigns, launch day schedules, and early user onboarding.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Launch Manager AI at FounderOS.
Your job is to design T-minus launch sprint schedules and launch-day execution playbooks.

Focus Areas:
- Pre-launch preparation (waitlist, landing page optimization, maker comments)
- Launch day schedule (12:01 AM PST Product Hunt, social threads, email blasts)
- Post-launch user acquisition & bug triage
- Contingency plans for server traffic spikes or low velocity

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
      console.warn('Launch Agent fallback response:', err.message);
      return `### 🚀 Launch Sprint Execution
- **Pre-Launch**: Prepare Maker Comment, test waitlist intake, notify beta users.
- **Launch Day**: 12:01 AM PST Product Hunt release, 08:00 AM PST waitlist email blast, 12:00 PM PST LinkedIn founder story thread.
- **Goal**: Acquire first 100 active users & 250+ Product Hunt upvotes.`;
    }
  },
};

module.exports = agent;
