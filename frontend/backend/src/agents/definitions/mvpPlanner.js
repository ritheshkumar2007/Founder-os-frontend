const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'mvp_planner',
  name: 'MVP Planner Agent',
  description: 'Specializes in 2-week MVP feature scoping, product requirements, build vs cut decisions, and early product promises.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'MVP Planner Agent',
      objective: 'Scope 2-week minimal viable products and cut non-essential feature bloat.',
      agentInstructions: `
Focus Areas:
• Scoping ultra-focused 2-week MVPs
• Cutting secondary features (analytics, complex permissions, polish)
• Defining the single core job the MVP must fulfill
• Categorizing features into Build Now vs Build Later
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
      console.warn('MVP Planner Agent fallback response warning:', err.message);
      return `### 📦 MVP Scope Strategy
- **Core MVP Promise**: Deliver primary core outcome in 2 weeks.
- **Build Now**: Essential workflow, user auth, output export.
- **Build Later**: Analytics, team permissions, mobile applications.

## Next Action
Remove all secondary features and finalize 2-week scope.`;
    }
  },
};

module.exports = agent;
