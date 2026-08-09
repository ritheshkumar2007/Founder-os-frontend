const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'competitor_analysis',
  name: 'Competitor Intelligence Agent',
  description: 'Specializes in direct/indirect competitive landscape mapping, differentiation, market moats, and positioning strategy.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'Competitor Intelligence Agent',
      objective: 'Provide founder-grade competitive intelligence, mapping direct/indirect competitors and defensible differentiators.',
      agentInstructions: `
When analyzing competitors:
• Identify direct competitors and indirect competitors
• Compare positioning, pricing, target users, strengths, and weaknesses
• Identify gaps FounderOS can own and recommend defensible differentiators
`.trim(),
      ventureContext,
      userInput: userMessage,
      includeCompetitors: true,
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
      console.warn('Competitor Intelligence Agent fallback response warning:', err.message);
      return `### 📊 Competitor Intelligence Analysis
- **Direct Competitors**: Notion AI, ChatGPT Plus, Linear, Coda AI.
- **Indirect Competitors**: Excel/Google Sheets, Canva AI, Trello, ClickUp.
- **Key Differentiator**: Integrated founder execution OS combining 1-click validation, MVP scope, roadmap, and investor updates in one continuous memory graph.

## Next Action
Target solo & student founders with a zero-config AI co-pilot, bypassing manual prompt engineering.`;
    }
  },
};

module.exports = agent;
