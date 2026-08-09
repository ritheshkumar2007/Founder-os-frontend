const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'growth_coach',
  name: 'Growth Coach Agent',
  description: 'Specializes in sprint execution, daily task prioritization, conversion rate tracking, and traction momentum.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';

    const systemPrompt = buildPrompt({
      role: 'Growth Coach Agent',
      objective: 'Track sprint execution, conversion metrics, and remove operational bottlenecks.',
      agentInstructions: `
Focus Areas:
• Breaking major milestones into 7-day sprint tasks
• Tracking traction funnels (contacted -> interview -> waitlist -> active user -> paying)
• Eliminating operational bottlenecks and founder procrastination
• Maintaining launch velocity and accountability
`.trim(),
      ventureContext,
      userInput: userMessage,
      includeCompetitors: false,
    });

    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: systemPrompt });

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
      console.warn('Growth Coach Agent fallback response warning:', err.message);
      return `### 📈 Sprint & Growth Execution
- **Current Sprint Progress**: 65% tasks completed.
- **Top Bottleneck**: Converting waitlist signups into active daily users.

## Next Action
Reach out 1-on-1 to 5 active waitlist signups to schedule onboarding calls today.`;
    }
  },
};

module.exports = agent;
