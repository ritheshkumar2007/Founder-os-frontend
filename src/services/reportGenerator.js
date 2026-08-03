const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildFounderContextWindow } = require('./memoryService');

const REPORT_METADATA = {
  venture_brief: {
    title: 'Venture Brief & Executive Summary',
    description: 'Core startup identity, problem, target customer, solution, and value proposition.',
  },
  validation_report: {
    title: 'Startup Validation & Risk Analysis Report',
    description: 'Empirical validation metrics, customer evidence, riskiest assumptions, and proof signals.',
  },
  customer_persona: {
    title: 'Ideal Customer Profile & Persona Analysis',
    description: 'Deep customer demographics, psychographics, core pain points, and current workarounds.',
  },
  competitor_analysis: {
    title: 'Competitive Landscape & Differentiation Strategy',
    description: 'Direct/indirect competitors, market gaps, competitive moats, and positioning.',
  },
  mvp_scope: {
    title: '2-Week MVP Product Requirements & Roadmap',
    description: 'Must-have feature scope, excluded features, core customer job, and build timeline.',
  },
  gtm_plan: {
    title: 'Go-To-Market & First 100 Users Acquisition Plan',
    description: 'Acquisition channels, outreach strategy, messaging, positioning, and conversion funnel.',
  },
  investor_summary: {
    title: 'Investor Memorandum & Pitch Summary',
    description: 'Executive pitch deck summary, traction signals, milestone commitments, and funding ask.',
  },
};

/**
 * AI Report Generator Engine
 * Uses Gemini to format fact-based, professional consulting documents.
 * 
 * @param {Object} params
 * @param {string} params.type - One of the 7 report types
 * @param {Object} params.venture - Venture Mongoose document
 * @param {Array} [params.history] - Conversation history
 * @param {Object} [params.previousReport] - Previous version of this report
 * @returns {Promise<Object>} Object containing { title, type, content, confidenceScore, changeExplanation }
 */
async function generateReportForType({ type, venture, history = [], previousReport = null }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const meta = REPORT_METADATA[type] || {
    title: type.replace(/_/g, ' ').toUpperCase(),
    description: 'Executive startup report.',
  };

  const memoryContext = buildFounderContextWindow(venture);

  const conversationSnippet = history.length > 0
    ? history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : 'No recent conversation transcript.';

  const previousContent = previousReport?.content || 'No previous version available.';

  const prompt = `You are a Principal Partner at a top Tier-1 Management Consulting firm (McKinsey/YC style) writing an executive report for FounderOS.

REPORT TYPE: ${meta.title} (${type})
DESCRIPTION: ${meta.description}

STRICT RULES:
1. NEVER INVENT FACTS. Base all numbers, customer quotes, claims, and features STRICTLY on the provided Venture parameters and founder conversation history.
2. The output MUST feel like a high-level, professional consulting document — complete with executive summary, strategic structured sections, bulleted insights, risk matrices, and actionable recommendations using GitHub Markdown syntax.
3. If data is sparse or missing for a section, state clearly what data is missing and recommend how the founder can validate it.
4. Calculate a "confidenceScore" (0-100) reflecting how well-validated and complete this report's parameters are.
5. Provide a "changeExplanation" explaining WHY this report's content evolved or updated compared to the previous version.

STARTUP PARAMETERS & LONG-TERM MEMORY:
${memoryContext}

RECENT CONVERSATION TRANSCRIPT:
${conversationSnippet}

PREVIOUS REPORT CONTENT SNAPSHOT:
${previousContent.slice(0, 1000)}

Return valid JSON ONLY in this EXACT structure:
{
  "title": "${meta.title}",
  "confidenceScore": number,
  "changeExplanation": "string explaining WHY content changed or updated",
  "content": "string containing full executive consulting report formatted in beautiful GitHub Markdown"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJsonText);

    return {
      title: data.title || meta.title,
      type,
      content: data.content || `# ${meta.title}\n\n*Report details pending.*`,
      confidenceScore: typeof data.confidenceScore === 'number' ? Math.min(100, Math.max(0, data.confidenceScore)) : 50,
      changeExplanation: data.changeExplanation || 'Report updated with latest founder insights.',
    };
  } catch (error) {
    console.error(`Report generation failed for ${type}:`, error.message || error);
    // Fallback professional report content
    return {
      title: meta.title,
      type,
      content: `# ${meta.title}\n\n## 1. Executive Summary\n- **Venture Name**: ${venture?.ventureName || 'Unnamed Venture'}\n- **Current Status**: Active Development\n\n## 2. Strategic Context\nThis report has been compiled based on saved venture parameters. Continue chatting with the FounderOS AI Co-pilot to deepen validation evidence.\n\n## 3. Recommended Actions\n- Complete customer problem validation\n- Define 2-week MVP feature scope`,
      confidenceScore: 40,
      changeExplanation: 'Initial executive baseline report created.',
    };
  }
}

module.exports = {
  REPORT_METADATA,
  generateReportForType,
};
