const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('../../prompts/buildPrompt');

const agent = {
  id: 'customer_research',
  name: 'Customer Research Agent',
  description: 'Specializes in target customer identification, interview questions, pain point analysis, current workarounds, and buyer personas.',

  async run({ userMessage, ventureContext, history = [] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildPrompt({
      role: 'Customer Research Agent',
      objective: 'Formulate non-leading customer discovery questions, ICP personas, and analyze manual workarounds.',
      agentInstructions: `
Focus Areas:
• Designing non-leading customer interview questions (Mom Test framework)
• Analyzing customer pain level, frequency, and current workarounds
• Constructing ideal customer profiles (ICP) and buyer personas
• Guiding 1-on-1 founder customer discovery outreach
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
      console.warn('Customer Research Agent fallback response warning:', err.message);
      return `### 🔍 Customer Discovery Research
- **Ideal Customer Profile**: Early-stage solo founders & student builders.
- **Core Interview Question**: "How do you currently handle startup validation & roadmap building, and how much time/money does it cost you?"

## Next Action
Conduct 3 non-leading customer discovery interviews this week.`;
    }
  },
};

module.exports = agent;
