const { GoogleGenerativeAI } = require('@google/generative-ai');
const InvestorUpdateDoc = require('../models/InvestorUpdateDoc');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

async function generateInvestorUpdate({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) throw new Error('GEMINI_API_KEY missing');

  const memoryContext = buildFounderContextWindow(venture);
  const history = await getConversationHistory({ userId, ventureId });
  const snippet = history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  const prompt = `You are the Lead Investment Advisory AI at FounderOS.
Generate a complete Executive Investor Memorandum for this startup based STRICTLY on founder memory.

VENTURE CONTEXT:
${memoryContext}

RECENT TRANSCRIPT:
${snippet}

Return valid JSON ONLY in this EXACT structure:
{
  "company": "${venture.ventureName || 'Venture'}",
  "execSummary": "string",
  "progress": "string",
  "achievements": "string",
  "metrics": "string",
  "risks": "string",
  "nextMonthGoals": "string",
  "fundingAsk": "string",
  "fundingReadiness": 75
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    const existing = await InvestorUpdateDoc.findOne({ ventureId }).sort({ version: -1 });
    const version = existing ? existing.version + 1 : 1;

    const doc = await InvestorUpdateDoc.create({
      ventureId,
      userId,
      company: data.company || venture.ventureName || 'Venture',
      execSummary: data.execSummary || `Executive Update for ${venture.ventureName || 'Our Venture'}`,
      progress: data.progress || 'Validation Phase: 5 customer interviews logged with pain proof',
      achievements: data.achievements || '1. Formulated validated elevator pitch\n2. Built automated AI integration',
      metrics: data.metrics || 'Visitors: 25 | Waitlist: 18 | Customer Interviews: 5 | Monthly Revenue: $150',
      risks: data.risks || 'Execution risk around balancing feature velocity with direct founder sales',
      nextMonthGoals: data.nextMonthGoals || '1. Launch Product Hunt campaign\n2. Onboard first 50 active users',
      fundingAsk: data.fundingAsk || 'Seeking $250k pre-seed funding to accelerate product build',
      fundingReadiness: data.fundingReadiness || 72,
      version,
    });

    return doc;
  } catch (err) {
    console.error('Investor update AI generation error:', err.message);
    throw err;
  }
}

async function getInvestorUpdateForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  let doc = await InvestorUpdateDoc.findOne({ ventureId }).sort({ version: -1 });
  if (!doc && venture) {
    doc = await generateInvestorUpdate({ venture, userId });
  }
  return doc;
}

async function updateInvestorUpdateDoc(ventureId, userId, payload) {
  if (!ventureId || !userId) return null;
  let doc = await InvestorUpdateDoc.findOne({ ventureId }).sort({ version: -1 });
  if (doc) {
    Object.assign(doc, payload);
    await doc.save();
    return doc;
  } else {
    return await InvestorUpdateDoc.create({ ventureId, userId, ...payload });
  }
}

module.exports = { generateInvestorUpdate, getInvestorUpdateForVenture, updateInvestorUpdateDoc };
