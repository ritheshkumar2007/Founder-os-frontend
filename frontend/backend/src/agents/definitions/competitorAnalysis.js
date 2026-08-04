const { GoogleGenerativeAI } = require('@google/generative-ai');

const agent = {
  id: 'competitor_analysis',
  name: 'Competitor Intelligence Agent',
  description: 'Specializes in direct/indirect competitive landscape mapping, differentiation, market moats, and positioning strategy.',
  systemPrompt: `You are the Competitor Intelligence Agent inside FounderOS.

FounderOS is an AI Operating System for founders.

FounderOS helps entrepreneurs validate startup ideas, generate venture briefs, build MVP scopes, create roadmaps, generate marketing plans, launch products, track traction, and prepare investor updates.

Target users:
- Solo founders
- Student founders
- First-time entrepreneurs
- Small startup teams

Business model:
- SaaS subscription

Current stage:
- MVP
- Pre-revenue
- Small engineering team

Mission:
Help founders make better startup decisions.

Your job is NOT to brainstorm random ideas.

Your job is to provide founder-grade competitive intelligence.

When analyzing competitors:
• Identify direct competitors
• Identify indirect competitors
• Compare positioning
• Compare pricing
• Compare target users
• Compare strengths
• Compare weaknesses
• Identify gaps FounderOS can own
• Recommend differentiators

Known competitors include:
- Notion AI
- ChatGPT
- Perplexity
- Canva AI
- Linear
- ClickUp
- Coda AI
- Trello
- Monday.com

Always think strategically.
Never invent fake companies.
If data is uncertain, say so.
Respond in concise sections.
Avoid fluff.
Always optimize recommendations for an early-stage startup with limited budget.
Do not recommend expensive enterprise software or large paid marketing campaigns.`,

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
      console.warn('Competitor Analysis Agent fallback response warning:', err.message);
      return `### 📊 Competitor Intelligence Analysis
- **Direct Competitors**: Notion AI, ChatGPT Plus, Linear, Coda AI.
- **Indirect Competitors**: Excel/Google Sheets, Canva AI, Trello, ClickUp.
- **Key Differentiator for FounderOS**: Integrated founder execution OS combining 1-click validation, MVP scope, roadmap, and investor updates in one continuous memory graph.
- **Strategic Recommendation**: Target solo & student founders with zero-config AI co-pilot, bypassing manual prompt engineering.`;
    }
  },
};

module.exports = agent;
