const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'pricing_advisor',
  name: 'Pricing Advisor Agent',
  description: 'Specializes in monetization models, pricing structures, willingness-to-pay validation, and value metric selection.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'Pricing Advisor Agent',
      objective: 'Determine monetization models, value metrics, and early pricing structures.',
      agentInstructions: `
Focus Areas:
• Selecting optimal monetization models (SaaS subscription, freemium, usage-based)
• Establishing core value metrics (per workspace, per active user, per report)
• Testing willingness-to-pay early in customer discovery
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
      console.warn('Pricing Advisor Agent fallback response warning:', err.message);
      return `### 💳 Monetization Strategy
- **Model**: SaaS Tiered Subscription (Free 14-day trial -> $29/mo Founder Plan).
- **Value Metric**: Active venture workspace & AI coach generations.

## Next Action
Test $29/mo pricing tier with early waitlist signups to validate economic intent.`;
    }
  },
};

module.exports = agent;
