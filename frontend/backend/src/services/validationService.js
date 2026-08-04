const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildFounderContextWindow } = require('./memoryService');

/**
 * AI Startup Validation Engine
 * Evaluates startup data & conversation history to score 6 key validation dimensions
 * with explanations, SWOT analysis, persona, MVP, pricing, and next actions.
 */
async function evaluateStartupValidation({ venture, history = [], userMessage = '', assistantReply = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const memoryContext = buildFounderContextWindow(venture);

  const conversationSnippet = history.length > 0
    ? history.slice(-10).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : `USER: ${userMessage}\nASSISTANT: ${assistantReply}`;

  const prompt = `You are the FounderOS AI Startup Validation Engine.
Analyze the provided venture context and recent conversation history to evaluate the startup's current validation state.

CRITICAL RULES:
1. NEVER invent facts, metrics, customers, or quotes. Base your evaluation STRICTLY on saved venture parameters and founder statements.
2. If key information is missing, list it in "missingInformation", lower the relevant score, and reduce "confidenceLevel" ('LOW', 'MEDIUM', or 'HIGH') rather than guessing.
3. Every score (0-100) MUST include a clear "explanation" stating WHY that score was assigned based on empirical evidence provided by the founder.

STARTUP PARAMETERS & LONG-TERM MEMORY:
${memoryContext}

RECENT CONVERSATION HISTORY:
${conversationSnippet}

Generate a JSON evaluation report in this EXACT JSON structure:
{
  "scores": {
    "overall": {
      "score": number,
      "explanation": "string explaining overall readiness score"
    },
    "problemValidation": {
      "score": number,
      "explanation": "string explaining problem severity and clarity evidence"
    },
    "customerValidation": {
      "score": number,
      "explanation": "string explaining customer interview and target audience validation evidence"
    },
    "marketValidation": {
      "score": number,
      "explanation": "string explaining market demand, size, and workaround evidence"
    },
    "competition": {
      "score": number,
      "explanation": "string explaining competitive positioning and differentiation"
    },
    "executionReadiness": {
      "score": number,
      "explanation": "string explaining MVP scope, roadmap, and build execution readiness"
    }
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "risks": ["string"],
  "opportunities": ["string"],
  "competitorSummary": "string",
  "customerPersona": "string",
  "recommendedMVP": "string",
  "recommendedPricingStrategy": "string",
  "top5NextActions": ["string"],
  "missingInformation": ["string"],
  "confidenceLevel": "LOW" | "MEDIUM" | "HIGH"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const reportData = JSON.parse(cleanJsonText);

    return reportData;
  } catch (error) {
    console.error('Validation Engine evaluation failed:', error.message || error);
    // Fallback safe evaluation structure if parsing or Gemini fails
    return {
      scores: {
        overall: { score: 20, explanation: 'Initial evaluation in progress. Provide more venture details.' },
        problemValidation: { score: 20, explanation: 'Problem definition submitted; interview validation recommended.' },
        customerValidation: { score: 10, explanation: 'Awaiting recorded customer interview data.' },
        marketValidation: { score: 20, explanation: 'Awaiting market size and pricing data.' },
        competition: { score: 20, explanation: 'Awaiting detailed competitive analysis.' },
        executionReadiness: { score: 30, explanation: 'Awaiting finalized MVP feature scope.' },
      },
      strengths: ['Founder has initiated venture brief setup.'],
      weaknesses: ['Limited customer interview evidence.'],
      risks: ['Building without sufficient validation.'],
      opportunities: ['Conduct 5 customer interviews to validate pain points.'],
      competitorSummary: 'Competitive analysis pending further founder inputs.',
      customerPersona: 'Target customer persona defined in venture brief.',
      recommendedMVP: 'Focus on 1 core must-have feature solving the primary pain point.',
      recommendedPricingStrategy: 'Validate willingness to pay during early user interviews.',
      top5NextActions: [
        'Complete Venture Brief details',
        'Identify top 3 riskiest assumptions',
        'Interview 5 prospective customers',
        'Define 2-week MVP scope',
        'Prepare 1-on-1 outreach script',
      ],
      missingInformation: ['Customer interview quotes', 'Pricing metrics', 'Competitor list'],
      confidenceLevel: 'LOW',
    };
  }
}

module.exports = {
  evaluateStartupValidation,
};
