const { GoogleGenerativeAI } = require('@google/generative-ai');
const founderContext = require('../shared/founderContext');
const outputRules = require('../shared/outputRules');
const toneRules = require('../shared/toneRules');
const constraints = require('../shared/constraints');

const agent = {
  id: 'roadmap_agent',
  name: 'Technical Roadmap Agent',
  description: 'Specializes in 4-phase technical & product execution roadmaps, milestone tracking, and task dependencies.',
  systemPrompt: `
${founderContext}

Role & Domain Expertise:
You are the Chief Technology Officer AI at FounderOS.
Your job is to break down product development into structured, executable technical phases.

Focus Areas:
- Phase 1: Problem & Target Audience Definition
- Phase 2: Customer Problem Validation
- Phase 3: 2-Week Core MVP Build
- Phase 4: Go-To-Market & First 100 Users
- Defining concrete tasks, estimates, and dependencies

${constraints}
${toneRules}
${outputRules}
`.trim(),

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
      console.warn('Roadmap Agent fallback response:', err.message);
      return `### 🗺️ Technical Execution Roadmap
- **Phase 1**: Problem & Persona Definition
- **Phase 2**: 5-10 Discovery Interviews
- **Phase 3**: 2-Week MVP Core Build
- **Phase 4**: Product Hunt & Direct Outreach Launch`;
    }
  },
};

module.exports = agent;
