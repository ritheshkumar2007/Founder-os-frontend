const { GoogleGenerativeAI } = require('@google/generative-ai');
const CoachRecommendation = require('../models/CoachRecommendation');
const ValidationReport = require('../models/ValidationReport');
const { buildFounderContextWindow } = require('./memoryService');

/**
 * AI Founder Coach Engine
 * Generates personalized coaching recommendations based on startup validation progress,
 * customer interviews, pricing, MVP scope, and execution risks.
 * Explains WHY each recommendation matters.
 */
async function evaluateCoachRecommendations({ venture, history = [], validationReport = null, userMessage = '', assistantReply = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const memoryContext = buildFounderContextWindow(venture);

  const validationSummary = validationReport
    ? `
Overall Score: ${validationReport.scores?.overall?.score || 0}/100
Problem Score: ${validationReport.scores?.problemValidation?.score || 0}/100
Customer Score: ${validationReport.scores?.customerValidation?.score || 0}/100
Market Score: ${validationReport.scores?.marketValidation?.score || 0}/100
Competition Score: ${validationReport.scores?.competition?.score || 0}/100
Execution Score: ${validationReport.scores?.executionReadiness?.score || 0}/100
Missing Info: ${(validationReport.missingInformation || []).join(', ')}
    `.trim()
    : 'Validation Report: Initial stage.';

  const conversationSnippet = history.length > 0
    ? history.slice(-8).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : `USER: ${userMessage}\nASSISTANT: ${assistantReply}`;

  const prompt = `You are the FounderOS AI Founder Coach.
Analyze the venture details, validation metrics, and recent conversation exchange to produce high-impact, personalized coaching recommendations.

RULES:
1. NEVER invent startup facts. Base your coaching strictly on the provided venture data and conversation.
2. For EVERY recommendation, explain WHY it matters to the founder's immediate progress instead of giving a plain task title.
3. Assess missing information, customer interviews, pricing validation, MVP scope, and execution risks.

STARTUP PARAMETERS & LONG-TERM MEMORY:
${memoryContext}

VALIDATION SUMMARY:
${validationSummary}

RECENT CONVERSATION HISTORY:
${conversationSnippet}

Generate a JSON object in this EXACT structure:
{
  "topPriority": "string detailing the single most urgent priority",
  "currentFocus": "string describing what the founder should focus on right now",
  "weeklyGoals": ["string (1-3 concrete weekly milestones)"],
  "nextBestAction": "string specifying the immediate next tactical step",
  "biggestRisk": "string explaining the highest risk to the venture right now",
  "biggestOpportunity": "string highlighting the highest leverage opportunity",
  "confidenceLevel": "LOW" | "MEDIUM" | "HIGH",
  "recommendations": [
    {
      "title": "string (actionable title)",
      "explanation": "string explaining WHY this matters for validation and growth",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reason": "string explaining the underlying business rationale"
    }
  ],
  "learningResources": [
    {
      "title": "string (resource name or topic)",
      "url": "string (optional URL or empty string)",
      "type": "Article" | "Guide" | "Framework",
      "reason": "string explaining why the founder should review this"
    }
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const coachData = JSON.parse(cleanJsonText);

    return coachData;
  } catch (error) {
    console.error('AI Founder Coach evaluation error:', error.message || error);
    // Safe fallback structure
    return {
      topPriority: 'Conduct 5 customer interviews to validate core pain point.',
      currentFocus: 'Idea & Problem Validation',
      weeklyGoals: ['Define riskiest assumption', 'Draft 5 interview questions', 'Schedule initial customer calls'],
      nextBestAction: 'Reach out to 3 potential target customers today.',
      biggestRisk: 'Building an MVP before confirming willingness to pay.',
      biggestOpportunity: 'Uncovering unaddressed customer workarounds early.',
      confidenceLevel: 'MEDIUM',
      recommendations: [
        {
          title: 'Conduct Customer Problem Interviews',
          explanation: 'Interviewing target customers prevents wasting weeks building a product nobody wants.',
          priority: 'HIGH',
          reason: 'Customer pain level validation is required before committing to code.',
        },
        {
          title: 'Define 2-Week MVP Scope',
          explanation: 'Scoping a minimal feature set forces focus on the core value proposition.',
          priority: 'MEDIUM',
          reason: 'Reduces build time and gets early feedback faster.',
        },
      ],
      learningResources: [
        {
          title: 'The Mom Test - Customer Validation Framework',
          url: 'https://momtestbook.com',
          type: 'Guide',
          reason: 'Learn how to talk to customers when everyone is lying to you.',
        },
      ],
    };
  }
}

/**
 * Upsert Coach Recommendations in MongoDB without creating duplicate records.
 * Preserves completed recommendation statuses across updates.
 */
async function upsertCoachRecommendations({ ventureId, userId, coachData }) {
  if (!ventureId || !userId || !coachData) return null;

  try {
    let existingDoc = await CoachRecommendation.findOne({ ventureId });

    const existingStatusMap = new Map();
    if (existingDoc && Array.isArray(existingDoc.recommendations)) {
      existingDoc.recommendations.forEach((item) => {
        if (item.title) {
          existingStatusMap.set(item.title.toLowerCase().trim(), item.status);
        }
      });
    }

    const formattedRecommendations = Array.isArray(coachData.recommendations)
      ? coachData.recommendations.map((rec) => {
          const key = (rec.title || '').toLowerCase().trim();
          const savedStatus = existingStatusMap.get(key) || 'PENDING';
          return {
            title: rec.title || 'Recommended Action',
            explanation: rec.explanation || 'Important for startup validation.',
            priority: ['HIGH', 'MEDIUM', 'LOW'].includes(rec.priority) ? rec.priority : 'MEDIUM',
            reason: rec.reason || 'Strategic priority based on venture stage.',
            status: savedStatus,
            createdAt: new Date(),
          };
        })
      : [];

    const formattedResources = Array.isArray(coachData.learningResources)
      ? coachData.learningResources.map((res) => ({
          title: res.title || 'Learning Resource',
          url: res.url || '',
          type: res.type || 'Article',
          reason: res.reason || '',
        }))
      : [];

    if (existingDoc) {
      existingDoc.topPriority = coachData.topPriority || existingDoc.topPriority;
      existingDoc.currentFocus = coachData.currentFocus || existingDoc.currentFocus;
      existingDoc.weeklyGoals = Array.isArray(coachData.weeklyGoals) ? coachData.weeklyGoals : existingDoc.weeklyGoals;
      existingDoc.nextBestAction = coachData.nextBestAction || existingDoc.nextBestAction;
      existingDoc.biggestRisk = coachData.biggestRisk || existingDoc.biggestRisk;
      existingDoc.biggestOpportunity = coachData.biggestOpportunity || existingDoc.biggestOpportunity;
      existingDoc.confidenceLevel = ['LOW', 'MEDIUM', 'HIGH'].includes(coachData.confidenceLevel) ? coachData.confidenceLevel : existingDoc.confidenceLevel;
      existingDoc.recommendations = formattedRecommendations;
      existingDoc.learningResources = formattedResources;
      existingDoc.lastUpdatedFromConversationAt = new Date();

      await existingDoc.save();
      return existingDoc;
    } else {
      const newDoc = await CoachRecommendation.create({
        ventureId,
        userId,
        topPriority: coachData.topPriority || '',
        currentFocus: coachData.currentFocus || 'Idea Validation',
        weeklyGoals: Array.isArray(coachData.weeklyGoals) ? coachData.weeklyGoals : [],
        nextBestAction: coachData.nextBestAction || '',
        biggestRisk: coachData.biggestRisk || '',
        biggestOpportunity: coachData.biggestOpportunity || '',
        confidenceLevel: coachData.confidenceLevel || 'MEDIUM',
        recommendations: formattedRecommendations,
        learningResources: formattedResources,
      });

      return newDoc;
    }
  } catch (error) {
    console.error('Failed to upsert CoachRecommendation:', error.message || error);
    return null;
  }
}

/**
 * Get formatted coach dashboard widget data for a venture
 */
async function getCoachDashboardData({ ventureId, userId }) {
  if (!ventureId) return null;

  const coachDoc = await CoachRecommendation.findOne({ ventureId });
  const validationDoc = await ValidationReport.findOne({ ventureId }).sort({ version: -1 });

  return {
    topPriority: coachDoc?.topPriority || 'Complete Venture Brief & Identify Target Customer',
    currentFocus: coachDoc?.currentFocus || 'Idea & Customer Validation',
    weeklyGoals: coachDoc?.weeklyGoals || ['Define riskiest assumption', 'Interview 5 target customers'],
    nextBestAction: coachDoc?.nextBestAction || 'Schedule customer problem validation calls',
    biggestRisk: coachDoc?.biggestRisk || 'Building features before validating pain level',
    biggestOpportunity: coachDoc?.biggestOpportunity || 'First-mover advantage in target niche',
    confidenceLevel: coachDoc?.confidenceLevel || 'MEDIUM',
    validationProgress: {
      overallScore: validationDoc?.scores?.overall?.score || 0,
      confidenceLevel: validationDoc?.confidenceLevel || 'LOW',
      lastEvaluatedAt: validationDoc?.updatedAt || null,
    },
    recommendations: coachDoc?.recommendations || [],
    learningResources: coachDoc?.learningResources || [],
  };
}

/**
 * Toggle or update the status of a specific recommendation item (e.g. COMPLETED or PENDING)
 */
async function toggleRecommendationStatus({ ventureId, userId, recommendationId, status }) {
  if (!ventureId || !recommendationId) return null;

  const coachDoc = await CoachRecommendation.findOne({ ventureId });
  if (!coachDoc) return null;

  const recItem = coachDoc.recommendations.id(recommendationId);
  if (!recItem) return null;

  recItem.status = ['PENDING', 'COMPLETED'].includes(status) ? status : (recItem.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
  await coachDoc.save();

  return coachDoc;
}

module.exports = {
  evaluateCoachRecommendations,
  upsertCoachRecommendations,
  getCoachDashboardData,
  toggleRecommendationStatus,
};
