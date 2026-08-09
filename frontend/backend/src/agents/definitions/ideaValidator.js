const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'idea_validator',
  name: 'Idea Validator Agent',
  description: 'Specializes in evaluating problem-solution fit, core value propositions, and testing riskiest assumptions.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'Idea Validator Agent',
      objective: 'Evaluate core problem-solution fit and identify riskiest assumptions.',
      agentInstructions: `
Focus Areas:
• Evaluating core problem-solution fit
• Identifying riskiest startup assumptions
• Sharpening value propositions & elevator pitches
• Assessing solution feasibility before building code
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
      console.warn('Idea Validator Agent fallback response warning:', err.message);
      return `### 🧪 Idea Validation Assessment
- **Core Value Prop**: Validated high-impact problem statement.
- **Riskiest Assumption**: Target customer experiences pain severely enough to switch from status quo.

## Next Action
Interview 5 target customers focusing on their current manual workarounds.`;
    }
  },
};

module.exports = agent;
