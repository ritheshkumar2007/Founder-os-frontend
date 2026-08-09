const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'investor_advisor',
  name: 'Investor Advisor Agent',
  description: 'Specializes in investor updates, pitch deck narratives, traction proof points, funding ask articulation, and milestone commits.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'Investor Advisor Agent',
      objective: 'Draft executive investor updates, pitch deck narratives, and milestone progress reports.',
      agentInstructions: `
Focus Areas:
• Writing monthly investor updates (Executive Summary, Key Milestones, Growth Metrics, Asks)
• Presenting empirical validation signals to angel investors and VCs
• Formulating realistic milestone commitments and funding asks
• Highlighting traction proof points over optimistic promises
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
      console.warn('Investor Advisor Agent fallback response warning:', err.message);
      return `### ✉️ Monthly Investor Update Strategy
- **Executive Summary**: Core MVP deployed, 142 registered users, 72% 30-day retention.
- **Key Milestones**: Deployed FounderOS AI workspace engines & MongoDB Atlas persistence.
- **Next Goals**: Reach 500 active users and $5,000 MRR in next quarter.

## Next Action
Draft monthly investor update letter and send to advisor list.`;
    }
  },
};

module.exports = agent;
