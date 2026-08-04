const { GoogleGenerativeAI } = require('@google/generative-ai');
const ValidationReport = require('../models/ValidationReport');
const MvpScope = require('../models/MvpScope');
const BuildRoadmap = require('../models/BuildRoadmap');
const MarketingPlan = require('../models/MarketingPlan');
const LaunchSprint = require('../models/LaunchSprint');
const Traction = require('../models/Traction');
const InvestorUpdate = require('../models/InvestorUpdate');

/**
 * Aggregates complete multi-module startup context across MongoDB models
 */
async function aggregateStartupContext(ventureId, userId) {
  const [val, mvp, road, mkt, launch, trac, inv] = await Promise.all([
    ValidationReport.findOne({ ventureId }).sort({ createdAt: -1 }),
    MvpScope.findOne({ ventureId }).sort({ createdAt: -1 }),
    BuildRoadmap.findOne({ ventureId }).sort({ createdAt: -1 }),
    MarketingPlan.findOne({ ventureId }).sort({ createdAt: -1 }),
    LaunchSprint.findOne({ ventureId }).sort({ createdAt: -1 }),
    Traction.findOne({ ventureId }).sort({ createdAt: -1 }),
    InvestorUpdate.findOne({ ventureId }).sort({ createdAt: -1 }),
  ]);

  return {
    validation: val ? `Score: ${val.overallScore}/100. Strengths: ${val.strengths?.join(', ')}. Risks: ${val.risks?.join(', ')}` : 'Not run yet',
    mvp: mvp?.generatedScope ? `MVP Name: ${mvp.generatedScope.mvpName}. Core Features: ${mvp.generatedScope.coreFeatures?.join(', ')}` : 'Not generated yet',
    roadmap: road?.roadmap ? `Overview: ${road.roadmap.overview}. Phases: ${road.roadmap.developmentPhases?.map((p) => p.phaseName).join(', ')}` : 'Not generated yet',
    marketing: mkt?.marketingStrategy ? `UVP: ${mkt.marketingStrategy.valueProposition}. Channels: ${mkt.marketingStrategy.marketingChannels?.map((c) => c.channel).join(', ')}` : 'Not generated yet',
    launch: launch?.sprintPlan ? `Goal: ${launch.launchDetails?.launchGoal}. T-minus launch date: ${launch.launchDetails?.launchDate}` : 'Not generated yet',
    traction: trac?.metrics ? `Total Users: ${trac.metrics.totalUsers}, MAU: ${trac.metrics.monthlyActiveUsers}, MRR: ${trac.metrics.revenue}, Retention: ${trac.metrics.retentionRate}` : 'Not generated yet',
    investor: inv?.investorMessage ? `Summary: ${inv.investorMessage.summary}. Funding Needs: ${inv.investorMessage.fundingNeeds}` : 'Not generated yet',
  };
}

/**
 * Service to execute Co-Founder AI chat via Gemini API with full startup context
 */
async function chatWithFounderAI({ userMessage, historyMessages, ventureId, userId }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }

  const context = await aggregateStartupContext(ventureId, userId);

  const systemPrompt = `You are FounderOS AI Co-Founder.

You are an expert startup founder, product manager, growth strategist, and investor advisor.

You have access to this startup context:

Idea Validation:
${context.validation}

MVP Scope:
${context.mvp}

Development Roadmap:
${context.roadmap}

Marketing Strategy:
${context.marketing}

Launch Plan:
${context.launch}

Traction:
${context.traction}

Investor Updates:
${context.investor}


Your job:
- Give practical startup advice
- Challenge bad assumptions
- Suggest next actions
- Prioritize tasks
- Think like a co-founder

Always format your response cleanly with:
### 1. Analysis
(Clear diagnostic of the situation)

### 2. Recommendation
(Actionable strategic decision)

### 3. Next Action Steps
(1-3 immediate steps for the founder to take today)`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format chat history for Gemini
    const contents = [];
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. I am your AI Co-Founder. Ready to advise based on your startup context.' }] });

    if (Array.isArray(historyMessages)) {
      historyMessages.slice(-6).forEach((msg) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });
    }

    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const result = await model.generateContent({ contents });
    return result.response.text();
  } catch (error) {
    console.error('Gemini Founder AI Service Error:', error.message || error);
    // Robust Co-Founder Fallback
    return `### 1. Analysis
Analyzing your query against your current venture context (${context.validation !== 'Not run yet' ? 'Validation score ready' : 'Initial startup phase'}):
Your core focus should be validating founder-market fit and securing early active user feedback before scaling complexity.

### 2. Recommendation
Maintain a lean 2-week MVP scope. Prioritize direct 1-on-1 customer outreach over paid advertising or premature feature additions.

### 3. Next Action Steps
1. Conduct 5 customer interview calls with target ICP users this week.
2. Verify top 3 pain points against your current MVP feature list.
3. Review your Build Roadmap phase 1 goals in FounderOS.`;
  }
}

module.exports = {
  chatWithFounderAI,
  aggregateStartupContext,
};
