const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'marketing_strategist',
  name: 'Marketing Strategist Agent',
  description: 'Specializes in Go-To-Market strategy, landing page messaging, channel selection, and getting the first 100 users.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'Marketing Strategist Agent',
      objective: 'Craft high-converting Go-To-Market strategies, acquisition channels, and zero-budget growth tactics.',
      agentInstructions: `
Focus Areas:
• Crafting landing page value propositions
• Recommending zero-cost acquisition channels (LinkedIn DMs, Product Hunt, Indie Hackers)
• Designing 1-on-1 direct outreach scripts and community launch playbooks
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
      console.warn('Marketing Strategist Agent fallback response warning:', err.message);
      return `### 🚀 Go-To-Market Strategy
- **Target Audience**: Solo founders & student builders.
- **Positioning**: AI Execution OS for early-stage founders.
- **Acquisition Channels**: Direct 1-on-1 LinkedIn outreach, Product Hunt launch, Indie Hackers build-in-public threads.

## Next Action
Launch 1-on-1 direct message outreach to 25 target founders on LinkedIn today.`;
    }
  },
};

module.exports = agent;
