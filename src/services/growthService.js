const { GoogleGenerativeAI } = require('@google/generative-ai');
const GrowthMetric = require('../models/GrowthMetric');
const GrowthRecommendation = require('../models/GrowthRecommendation');
const CustomerFeedback = require('../models/CustomerFeedback');
const { buildFounderContextWindow } = require('./memoryService');

/**
 * Save or update growth metrics for a venture
 */
async function upsertGrowthMetrics({ ventureId, userId, metrics }) {
  if (!ventureId || !userId) return null;

  let existing = await GrowthMetric.findOne({ ventureId }).sort({ recordedAt: -1 });

  const dataToUpdate = {
    ventureId,
    userId,
    visitors: metrics?.visitors ?? existing?.visitors ?? 0,
    signups: metrics?.signups ?? existing?.signups ?? 0,
    activatedUsers: metrics?.activatedUsers ?? existing?.activatedUsers ?? 0,
    payingCustomers: metrics?.payingCustomers ?? existing?.payingCustomers ?? 0,
    customerInterviews: metrics?.customerInterviews ?? existing?.customerInterviews ?? 0,
    revenue: metrics?.revenue ?? existing?.revenue ?? 0,
    retentionRate: metrics?.retentionRate ?? existing?.retentionRate ?? 0,
    recordedAt: new Date(),
  };

  if (existing) {
    Object.assign(existing, dataToUpdate);
    await existing.save();
    return existing;
  } else {
    return await GrowthMetric.create(dataToUpdate);
  }
}

/**
 * AI Growth Analysis Engine
 * Calculates Growth Score, Bottleneck Analysis, Weekly Review, Growth Recommendations (with reasoning), & Experiments.
 */
async function analyzeGrowthAndRecommendations({ venture, userId, history = [] }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;

  let metricsDoc = await GrowthMetric.findOne({ ventureId }).sort({ recordedAt: -1 });
  if (!metricsDoc) {
    metricsDoc = await upsertGrowthMetrics({ ventureId, userId, metrics: {} });
  }

  const feedbackList = await CustomerFeedback.find({ ventureId }).limit(10);
  const apiKey = process.env.GEMINI_API_KEY;

  let growthScore = 45;
  let bottleneck = 'Customer Acquisition Funnel: Low initial traffic to signup conversion.';
  let weeklyReview = 'Startup is in early customer discovery phase. Focus on conducting customer interviews.';
  let recommendations = [
    {
      title: 'Conduct 5 Mom-Test Customer Interviews',
      category: 'Acquisition',
      action: 'Reach out to 10 prospective ICP targets on LinkedIn with non-sales questions.',
      reasoning: 'Without validated customer pain signals, building product features carries high risk.',
      priority: 'HIGH',
    },
    {
      title: 'Craft Clear Landing Page Value Proposition',
      category: 'Activation',
      action: 'Update hero title to clearly state the core problem solved in 10 words or less.',
      reasoning: 'First-time visitors drop off within 5 seconds if the value proposition is vague.',
      priority: 'HIGH',
    },
  ];
  let experimentIdeas = [
    'Test cold DM outreach script vs cold email for interview requests',
    'A/B test landing page hero headline focusing on pain vs benefit',
  ];

  if (apiKey && apiKey.trim()) {
    try {
      const memoryContext = buildFounderContextWindow(venture);
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are the FounderOS Growth OS Intelligence Engine.
Analyze the startup parameters and metrics to calculate growth analytics and actionable recommendations.

CURRENT METRICS:
- Visitors: ${metricsDoc.visitors}
- Signups: ${metricsDoc.signups}
- Activated Users: ${metricsDoc.activatedUsers}
- Paying Customers: ${metricsDoc.payingCustomers}
- Customer Interviews: ${metricsDoc.customerInterviews}
- Revenue: $${metricsDoc.revenue}
- Retention Rate: ${metricsDoc.retentionRate}%

FEEDBACK SAMPLES:
${feedbackList.map((f) => `- [${f.sentiment}] (${f.theme}): ${f.rawText}`).join('\n') || 'No feedback records yet.'}

LONG-TERM MEMORY:
${memoryContext}

STRICT RULE:
For EVERY recommendation, you MUST provide an explicit "reasoning" string explaining WHY this recommendation is required based ONLY on available data.

Return valid JSON ONLY in this EXACT structure:
{
  "growthScore": number (0-100),
  "bottleneck": "string (identifying the single main growth bottleneck)",
  "weeklyReview": "string (summary of growth progress)",
  "experimentIdeas": ["string"],
  "recommendations": [
    {
      "title": "string",
      "category": "Acquisition|Activation|Monetization|Retention|Content|Experiment",
      "action": "string",
      "reasoning": "string explaining WHY this recommendation is necessary",
      "priority": "HIGH|MEDIUM|LOW"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanJsonText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);

      if (typeof parsed.growthScore === 'number') growthScore = Math.min(100, Math.max(0, parsed.growthScore));
      if (parsed.bottleneck) bottleneck = parsed.bottleneck;
      if (parsed.weeklyReview) weeklyReview = parsed.weeklyReview;
      if (Array.isArray(parsed.experimentIdeas)) experimentIdeas = parsed.experimentIdeas;
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        recommendations = parsed.recommendations;
      }
    } catch (err) {
      console.warn('AI Growth analysis fallback:', err.message);
    }
  }

  // Save metrics update with score & bottleneck
  metricsDoc.growthScore = growthScore;
  metricsDoc.bottleneck = bottleneck;
  metricsDoc.weeklyReview = weeklyReview;
  await metricsDoc.save();

  // Save recommendations in MongoDB
  await GrowthRecommendation.deleteMany({ ventureId, status: 'PROPOSED' });
  const savedRecs = await Promise.all(
    recommendations.map(async (r) => {
      return await GrowthRecommendation.create({
        ventureId,
        userId,
        title: r.title || 'Growth Action',
        category: r.category || 'Acquisition',
        action: r.action || 'Execute growth task',
        reasoning: r.reasoning || 'Based on startup funnel metrics analysis.',
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(r.priority) ? r.priority : 'MEDIUM',
        status: 'PROPOSED',
      });
    })
  );

  return {
    metrics: metricsDoc,
    recommendations: savedRecs,
    experimentIdeas,
  };
}

/**
 * Customer Feedback Analyzer
 * Groups raw feedback into themes, sentiment, and impact
 */
async function analyzeAndGroupFeedback({ ventureId, userId, rawText, customerSegment = 'Early Adopter' }) {
  if (!ventureId || !userId || !rawText) return null;

  const apiKey = process.env.GEMINI_API_KEY;
  let theme = 'Usability & Feature Request';
  let sentiment = 'NEUTRAL';
  let impact = 'MEDIUM';

  if (apiKey && apiKey.trim()) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this raw customer feedback for a startup and classify it:
FEEDBACK: "${rawText}"

Return valid JSON ONLY in this EXACT structure:
{
  "theme": "string (2-4 word topic theme)",
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "impact": "HIGH|MEDIUM|LOW"
}`;

      const result = await model.generateContent(prompt);
      const cleanJsonText = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);

      if (parsed.theme) theme = parsed.theme;
      if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(parsed.sentiment)) sentiment = parsed.sentiment;
      if (['HIGH', 'MEDIUM', 'LOW'].includes(parsed.impact)) impact = parsed.impact;
    } catch (err) {
      console.warn('Feedback analysis fallback:', err.message);
    }
  }

  const feedbackDoc = await CustomerFeedback.create({
    ventureId,
    userId,
    rawText: rawText.trim(),
    customerSegment,
    theme,
    sentiment,
    impact,
  });

  return feedbackDoc;
}

/**
 * AI Content Studio Generator
 * Generates copy suggestions for Landing Page, Product Hunt, Blog Posts, Social Posts, Email Campaigns
 */
async function generateGrowthContent({ venture, contentType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is required for AI Content Studio.');
  }

  const memoryContext = buildFounderContextWindow(venture);

  const prompt = `You are the FounderOS Growth OS AI Content Copywriter.
Generate high-converting, professional marketing and growth copy for the following content channel:

CONTENT TYPE: ${contentType} (options: landing_page, product_hunt, blog_post, social_post, email_campaign)

VENTURE CONTEXT & LONG-TERM MEMORY:
${memoryContext}

FORMATTING INSTRUCTIONS:
- Use clean GitHub Markdown syntax.
- Write compelling, non-generic copy tailored specifically to this startup's target customer and problem.

Generate the complete, high-converting content package.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Content generation error:', error.message || error);
    return `# ${contentType.toUpperCase()} Copy Draft\n\n*Content generation encountered a temporary error. Please try again.*`;
  }
}

/**
 * Get all latest growth data for a venture
 */
async function getLatestGrowthData(ventureId) {
  if (!ventureId) return null;

  const metrics = await GrowthMetric.findOne({ ventureId }).sort({ recordedAt: -1 });
  const recommendations = await GrowthRecommendation.find({ ventureId }).sort({ priority: -1 });
  const feedback = await CustomerFeedback.find({ ventureId }).sort({ createdAt: -1 });

  return {
    metrics,
    recommendations,
    feedback,
  };
}

module.exports = {
  upsertGrowthMetrics,
  analyzeGrowthAndRecommendations,
  analyzeAndGroupFeedback,
  generateGrowthContent,
  getLatestGrowthData,
};
