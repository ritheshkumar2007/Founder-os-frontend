const { GoogleGenerativeAI } = require('@google/generative-ai');
const TractionData = require('../models/TractionData');
const ValidationReport = require('../models/ValidationReport');
const GrowthMetric = require('../models/GrowthMetric');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

async function generateTractionData({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) throw new Error('GEMINI_API_KEY missing');

  const memoryContext = buildFounderContextWindow(venture);
  const valReport = await ValidationReport.findOne({ ventureId }).sort({ version: -1 });
  const growthDoc = await GrowthMetric.findOne({ ventureId });

  const valScore = valReport?.scores?.overallValidationScore || 78;
  const growthScore = growthDoc?.growthScore || 50;
  const executionScore = 65;
  const overallScore = Math.round((valScore + executionScore + growthScore) / 3);

  const prompt = `You are the Startup Traction Analyst AI at FounderOS.
Generate real startup health insights based on founder memory.

VENTURE CONTEXT:
${memoryContext}

SCORES: Validation=${valScore}, Execution=${executionScore}, Growth=${growthScore}, Overall=${overallScore}

Return valid JSON ONLY in this EXACT structure:
{
  "customerInterviews": 5,
  "tasksCompleted": 8,
  "weeklyProgress": "65% Sprint Completion",
  "currentFocus": "string",
  "biggestRisk": "string",
  "biggestOpportunity": "string",
  "latestRecommendation": "string"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    const existing = await TractionData.findOne({ ventureId }).sort({ version: -1 });
    const version = existing ? existing.version + 1 : 1;

    const doc = await TractionData.create({
      ventureId,
      userId,
      scores: { validationScore: valScore, executionScore, growthScore, overallScore },
      dashboard: {
        customerInterviews: data.customerInterviews || 5,
        tasksCompleted: data.tasksCompleted || 8,
        weeklyProgress: data.weeklyProgress || '65% Sprint Completion',
        currentFocus: data.currentFocus || 'Conduct customer problem validation interviews',
        biggestRisk: data.biggestRisk || 'Building features before confirming willingness-to-pay',
        biggestOpportunity: data.biggestOpportunity || 'Strong organic interest from target founders',
        latestRecommendation: data.latestRecommendation || 'Launch 1-on-1 direct outreach to 30 ICP contacts',
      },
      metricsInput: {
        contacted: growthDoc?.visitors || 25,
        interviews: growthDoc?.customerInterviews || 5,
        waitlist: growthDoc?.signups || 18,
        active: growthDoc?.activatedUsers || 12,
        paying: growthDoc?.payingCustomers || 3,
        revenue: growthDoc?.revenue || 150,
      },
      version,
    });

    return doc;
  } catch (err) {
    console.error('Traction data AI generation error:', err.message);
    throw err;
  }
}

async function getTractionDataForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  let doc = await TractionData.findOne({ ventureId }).sort({ version: -1 });
  if (!doc && venture) {
    doc = await generateTractionData({ venture, userId });
  }
  return doc;
}

async function updateTractionData(ventureId, userId, payload) {
  if (!ventureId || !userId) return null;
  let doc = await TractionData.findOne({ ventureId }).sort({ version: -1 });
  if (doc) {
    if (payload.scores) doc.scores = { ...doc.scores, ...payload.scores };
    if (payload.dashboard) doc.dashboard = { ...doc.dashboard, ...payload.dashboard };
    if (payload.metricsInput) doc.metricsInput = { ...doc.metricsInput, ...payload.metricsInput };
    await doc.save();
    return doc;
  } else {
    return await TractionData.create({ ventureId, userId, ...payload });
  }
}

module.exports = { generateTractionData, getTractionDataForVenture, updateTractionData };
