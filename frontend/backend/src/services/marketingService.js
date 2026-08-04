const { GoogleGenerativeAI } = require('@google/generative-ai');
const MarketingPlan = require('../models/MarketingPlan');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

async function generateMarketingPlan({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) throw new Error('GEMINI_API_KEY missing');

  const memoryContext = buildFounderContextWindow(venture);
  const history = await getConversationHistory({ userId, ventureId });
  const snippet = history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

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

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    const existing = await MarketingPlan.findOne({ ventureId }).sort({ version: -1 });
    const version = existing ? existing.version + 1 : 1;

    const doc = await MarketingPlan.create({
      ventureId,
      userId,
      idealCustomer: data.idealCustomer || 'Ideal early adopter founders',
      positioning: data.positioning || 'Positioned as the AI Execution OS for founders',
      uvp: data.uvp || 'Automates validation, roadmap building, and GTM content',
      channels: data.channels || 'LinkedIn DMs, Product Hunt, Indie Hackers',
      launchStrategy: data.launchStrategy || 'Direct 1-on-1 founder outreach',
      contentStrategy: data.contentStrategy || 'Build in public teardowns & founder learnings',
      seoPlan: data.seoPlan || 'Target high-intent keywords: AI startup coach, 2 week MVP scope',
      socialMediaPlan: data.socialMediaPlan || 'Daily threads on X/Twitter & LinkedIn',
      emailCampaign: data.emailCampaign || '3-part onboarding drip sequence',
      referralStrategy: data.referralStrategy || '1 extra month of AI credits per founder referral',
      version,
    });

    return doc;
  } catch (err) {
    console.error('Marketing plan AI generation error:', err.message);
    throw err;
  }
}

async function getMarketingPlanForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  let doc = await MarketingPlan.findOne({ ventureId }).sort({ version: -1 });
  if (!doc && venture) {
    doc = await generateMarketingPlan({ venture, userId });
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
