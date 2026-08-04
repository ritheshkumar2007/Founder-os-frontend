const { GoogleGenerativeAI } = require('@google/generative-ai');
const MarketingPlan = require('../models/MarketingPlan');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

async function generateMarketingPlan({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;
  const isDbConnected = mongoose.connection.readyState === 1;

  const memoryContext = buildFounderContextWindow(venture);
  const history = isDbConnected ? await getConversationHistory({ userId, ventureId }).catch(() => []) : [];
  const snippet = history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  try {
    let data = {
      idealCustomer: 'Early adopter founders & builders',
      positioning: 'Positioned as the AI Execution OS for founders',
      uvp: 'Automates validation, roadmap building, and GTM content',
      channels: 'LinkedIn DMs, Product Hunt, Indie Hackers',
      launchStrategy: 'Direct 1-on-1 founder outreach',
      contentStrategy: 'Build in public teardowns & founder learnings',
      seoPlan: 'Target high-intent keywords: AI startup coach, 2 week MVP scope',
      socialMediaPlan: 'Daily threads on X/Twitter & LinkedIn',
      emailCampaign: '3-part onboarding drip sequence',
      referralStrategy: '1 extra month of AI credits per founder referral',
    };

    if (apiKey && apiKey.trim()) {
      const prompt = `You are the Chief Marketing Officer AI at FounderOS.
Generate a complete 10-part Go-To-Market Marketing Plan for this startup based STRICTLY on founder memory.

VENTURE CONTEXT:
${memoryContext}

RECENT TRANSCRIPT:
${snippet}

Return valid JSON ONLY in this EXACT structure:
{
  "idealCustomer": "string",
  "positioning": "string",
  "uvp": "string",
  "channels": "string",
  "launchStrategy": "string",
  "contentStrategy": "string",
  "seoPlan": "string",
  "socialMediaPlan": "string",
  "emailCampaign": "string",
  "referralStrategy": "string"
}`;

      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      data = JSON.parse(cleanJson);
    }

    if (isDbConnected) {
      const existing = await MarketingPlan.findOne({ ventureId }).sort({ version: -1 }).catch(() => null);
      const version = existing ? existing.version + 1 : 1;

      return await MarketingPlan.create({
        ventureId,
        userId,
        ...data,
        version,
      }).catch(() => null);
    }

    return {
      ventureId,
      userId,
      ...data,
      version: 1,
    };
  } catch (err) {
    console.error('Marketing plan AI generation warning:', err.message);
    return {
      ventureId,
      userId,
      idealCustomer: 'Early adopter founders',
      positioning: 'AI Execution OS for founders',
      uvp: 'Automates validation, roadmap building, and GTM',
      channels: 'LinkedIn, Product Hunt',
      version: 1,
    };
  }
}

async function getMarketingPlanForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  const isDbConnected = mongoose.connection.readyState === 1;
  let doc = isDbConnected ? await MarketingPlan.findOne({ ventureId }).sort({ version: -1 }).catch(() => null) : null;
  if (!doc) {
    doc = await generateMarketingPlan({ venture: venture || { _id: ventureId }, userId });
  }
  return doc;
}

async function updateMarketingPlan(ventureId, userId, planData) {
  if (!ventureId || !userId) return null;
  let doc = await MarketingPlan.findOne({ ventureId }).sort({ version: -1 });
  if (doc) {
    Object.assign(doc, planData);
    await doc.save();
    return doc;
  } else {
    return await MarketingPlan.create({ ventureId, userId, ...planData });
  }
}

module.exports = { generateMarketingPlan, getMarketingPlanForVenture, updateMarketingPlan };
