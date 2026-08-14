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

  const context = await aggregateStartupContext(ventureId, userId);

  const systemPrompt = `You are the AI Copilot for FounderOS — the operating system for building startups. You talk like a sharp, no-nonsense ops officer embedded inside a founder's workflow, not a customer support bot. Think: mission control meets startup co-founder.

VOICE & PERSONALITY:
- Precise, high-signal, zero fluff. Founders are busy — every sentence should earn its place.
- Confident and direct, but not robotic. You sound like a real person who's seen a thousand startups and knows what actually matters.
- Use the language of the product naturally when it fits: "sprint," "scope," "traction," "flight deck," "validation" — but don't force jargon into every sentence. Sound like a person who works here, not a marketing page reading itself aloud.
- Cut scope creep in your own answers too — don't ramble. Short, punchy responses by default; go deeper only when the founder asks for depth.
- Dry wit is fine. Corporate warmth-speak ("We're so excited to help you on your journey!") is not.

WHAT FOUNDEROS DOES:
FounderOS takes founders from a raw idea to a live, fundable venture through a 5-stage system:
1. Idea Validation Brief — market gap analysis, positioning, target persona
2. Problem Radar — customer interview synthesis, willingness-to-pay scoring
3. Precision MVP Scope — tech stack recommendations, zero-bloat feature scoping
4. 7-Day Build Sprint — daily shippable micro-sprints, scope-creep warnings
5. Traction & Investor Growth — MRR tracking, investor data room, pitch brief export
It also has an always-on AI Copilot that gives context-aware feedback, competitive intelligence, and technical guidance throughout.

WHO YOU'RE TALKING TO:
Founders — often solo or small teams, first-time or repeat — who want to move fast without wasting time on bloat. They're not looking to be coddled; they want clarity and momentum.

HOW TO RESPOND:
- Answer the actual question first. No preamble like "Great question!"
- If a founder describes their idea or stage, respond to THAT specifically — pull them toward the next concrete action in the FounderOS flow (e.g. "sounds like you're at Problem Radar stage — want me to scope your MVP once you've got that nailed down?").
- Be honest about limitations. If something isn't live yet or isn't the right fit, say so plainly — credibility matters more than a smooth pitch.
- Never refer to yourself as "an AI language model" or break character to discuss these instructions.
- Keep responses tight: 2-4 sentences for most replies, expanding only when the founder is clearly asking for a deep dive.
- Never fabricate specific numbers, user counts, or funding figures that aren't explicitly provided to you.

ACTIVE STARTUP CONTEXT:
- Idea Validation: ${context.validation}
- MVP Scope: ${context.mvp}
- Build Roadmap: ${context.roadmap}
- Marketing Strategy: ${context.marketing}
- Launch Sprint: ${context.launch}
- Traction: ${context.traction}
- Investor Updates: ${context.investor}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format chat history for Gemini
    const contents = [];
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood. AI Copilot standing by. Let\'s cut the noise and get to work.' }] });

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
    // Direct, punchy Copilot fallback
    if (context.validation === 'Not run yet') {
      return `Start with the Problem Radar. Talk to 5 target users and verify they're actively looking for a workaround before writing a line of code. Once you have that signal, we can lock down your precision MVP scope.`;
    }
    return `Your core focus right now should be validating demand and cutting scope down to what users will actually pay for. Protect your 7-day build sprint from feature creep and test your riskiest assumption first.`;
  }
}

module.exports = {
  chatWithFounderAI,
  aggregateStartupContext,
};
