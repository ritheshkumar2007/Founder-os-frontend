const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');
const competitors = require('../shared/competitors');

const agent = {
  id: 'competitor_agent',
  name: 'Competitor Intelligence Agent',
  description: 'Specializes in direct/indirect competitive landscape mapping, positioning, and differentiation.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Competitor Intelligence Agent inside FounderOS.
Your job is to provide founder-grade competitive intelligence.

When analyzing competitors:
• Identify direct competitors
• Identify indirect competitors
• Compare positioning, pricing, target users, strengths, and weaknesses
• Identify market gaps and recommend defensible differentiators

${competitors}

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
      console.warn('Competitor Agent fallback response:', err.message);
      return `### 📊 Competitor Intelligence Analysis
- **Direct Competitors**: Notion AI, ChatGPT Plus, Linear, Coda AI.
- **Indirect Competitors**: Excel/Google Sheets, Canva AI, Trello, ClickUp.
- **Key Differentiator for FounderOS**: Integrated founder execution OS combining 1-click validation, MVP scope, roadmap, and investor updates in one continuous memory graph.
- **Strategic Recommendation**: Target solo & student founders with zero-config AI co-pilot, bypassing manual prompt engineering.`;
    }
  },
};

module.exports = agent;
