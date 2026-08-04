const { GoogleGenerativeAI } = require('@google/generative-ai');
const MvpScope = require('../models/MvpScope');
const ValidationReport = require('../models/ValidationReport');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

/**
 * Generate a 2-week MVP Scope using Gemini AI based on Venture parameters,
 * Founder Conversation, Validation Report, Customer, Problem, and Solution.
 */
async function generateMvpScope({ venture, userId }) {
  if (!venture || !userId) return null;

  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // 1. Gather Context: Conversation History & Validation Report
  const history = await getConversationHistory({ userId, ventureId });
  const validationReport = await ValidationReport.findOne({ ventureId }).sort({ version: -1 });

  const conversationSnippet = history.length > 0
    ? history.slice(-10).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : 'No conversation history logged yet.';

  const validationSnippet = validationReport
    ? `Overall Validation Score: ${validationReport.scores?.overallValidationScore || 50}\nRecommended MVP: ${JSON.stringify(validationReport.recommendations?.recommendedMVP || {})}`
    : 'No validation report logged yet.';

  const memoryContext = buildFounderContextWindow(venture);

  const prompt = `You are the Lead Startup Technical Architect at FounderOS.
Generate a structured 2-week MVP Scope for this startup based STRICTLY on the founder's validated context.

STARTUP PARAMETERS & LONG-TERM MEMORY:
${memoryContext}

CUSTOMER DISCOVERY & CONVERSATION HISTORY:
${conversationSnippet}

VALIDATION REPORT ANALYSIS:
${validationSnippet}

REQUIREMENTS:
1. Define a clear "coreGoal" describing the single primary outcome this 2-week MVP delivers.
2. Provide a list of 5-8 features distributed across 4 categories:
   - "Must Have" (3-4 essential features for initial launch)
   - "Should Have" (1-2 important secondary features)
   - "Nice To Have" (1-2 non-essential polish items)
   - "Future Features" (1-2 features deferred to post-PMF v2)
3. For EVERY feature, provide:
   - "name": string
   - "category": "Must Have" | "Should Have" | "Nice To Have" | "Future Features"
   - "priority": "HIGH" | "MEDIUM" | "LOW"
   - "businessValue": string (e.g. "Core Utility", "User Retention", "High Conversion")
   - "complexity": "Low" | "Medium" | "High"
   - "reason": string explaining WHY this feature is in this category based on founder context
   - "estimatedTime": string (e.g. "1 day", "2-3 days", "1 week")

Return valid JSON ONLY in this EXACT structure:
{
  "coreGoal": "string",
  "features": [
    {
      "name": "string",
      "category": "Must Have",
      "priority": "HIGH",
      "businessValue": "string",
      "complexity": "Medium",
      "reason": "string",
      "estimatedTime": "2 days"
    }
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJsonText);

    const formattedFeatures = (data.features || []).map((f, idx) => ({
      id: `f-${Date.now()}-${idx}`,
      name: f.name || `Feature ${idx + 1}`,
      category: ['Must Have', 'Should Have', 'Nice To Have', 'Future Features'].includes(f.category)
        ? f.category
        : 'Must Have',
      priority: ['HIGH', 'MEDIUM', 'LOW'].includes(f.priority) ? f.priority : 'MEDIUM',
      businessValue: f.businessValue || 'High Impact',
      complexity: ['Low', 'Medium', 'High'].includes(f.complexity) ? f.complexity : 'Medium',
      reason: f.reason || 'Based on founder conversation validation.',
      estimatedTime: f.estimatedTime || '2 days',
    }));

    // Find latest existing MVP scope version to increment version number
    const existing = await MvpScope.findOne({ ventureId }).sort({ version: -1 });
    const version = existing ? existing.version + 1 : 1;

    // Overwrite / Create new version in MongoDB
    const mvpDoc = await MvpScope.create({
      ventureId,
      userId,
      coreGoal: data.coreGoal || `Build 2-week MVP for ${venture.ventureName || 'the venture'}`,
      features: formattedFeatures,
      version,
    });

    return mvpDoc;
  } catch (error) {
    console.error('AI MVP Scope generation error:', error.message || error);
    throw error;
  }
}

/**
 * Get saved MVP Scope from MongoDB. If none exists, automatically generate one.
 */
async function getMvpScopeForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;

  let mvpDoc = await MvpScope.findOne({ ventureId }).sort({ version: -1 });

  if (!mvpDoc && venture) {
    mvpDoc = await generateMvpScope({ venture, userId });
  }

  return mvpDoc;
}

/**
 * Persist manual founder updates (edits, additions, deletions) to MongoDB
 */
async function updateMvpScope(ventureId, userId, { coreGoal, features }) {
  if (!ventureId || !userId) return null;

  let mvpDoc = await MvpScope.findOne({ ventureId }).sort({ version: -1 });

  if (mvpDoc) {
    if (typeof coreGoal === 'string') mvpDoc.coreGoal = coreGoal.trim();
    if (Array.isArray(features)) mvpDoc.features = features;
    await mvpDoc.save();
    return mvpDoc;
  } else {
    return await MvpScope.create({
      ventureId,
      userId,
      coreGoal: coreGoal || 'Build 2-week MVP',
      features: features || [],
    });
  }
}

module.exports = {
  generateMvpScope,
  getMvpScopeForVenture,
  updateMvpScope,
};
