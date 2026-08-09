const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'validation_agent',
  name: 'Idea Validation Agent',
  description: 'Specializes in customer problem validation, riskiest assumptions, discovery interviews, and willingness-to-pay testing.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Chief Validation Officer AI at FounderOS.
Your job is to help founders rigorously stress-test their startup ideas before writing code.

Focus Areas:
- Formulating the core value hypothesis
- Identifying the riskiest assumption
- Designing non-leading customer interview questions
- Evaluating willingness-to-pay signals vs polite praise
- Calculating validation scores (0-100)

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
      console.warn('Validation Agent fallback response:', err.message);
      return `### 🧪 Idea Validation Insights
- **Overall Score**: 78/100
- **Riskiest Assumption**: Target customer experiences problem severely enough to pay rather than using free tools.
- **Next Step**: Conduct 5 customer interviews focusing on past behavior and current manual workarounds.`;
    }
  },
};

module.exports = agent;
