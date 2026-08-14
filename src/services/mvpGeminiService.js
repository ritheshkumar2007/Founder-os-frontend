const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate MVP Scope JSON via Gemini API using the FounderOS MVP Scope Architect.
 * Grounded in the founder's 5 validation answers and scorecard.
 */
async function generateMvpScopeFromGemini({
  ventureName,
  idea,
  targetUsers,
  problem,
  alternatives,
  painFrequency,
  differentiation,
  evidence,
  validationScore,
  weakestCategory,
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  const resolvedName = ventureName || 'Untitled Venture';
  const resolvedIdea = idea || 'Startup Concept';
  const resolvedAudience = targetUsers || 'Target Customer Segments';
  const resolvedProblem = problem || 'Core Customer Problem';
  const resolvedAlternatives = alternatives || 'Current status-quo workarounds and spreadsheets';
  const resolvedPain = painFrequency || 'Frequent operational blocker with high friction';
  const resolvedDifferentiation = differentiation || 'Direct, autonomous workflow solving the core friction point';
  const resolvedEvidence = evidence || 'Early customer discovery signals and pilot interest';
  const scoreNumber = typeof validationScore === 'number' ? validationScore : (validationScore?.overallScore ?? 75);

  const prompt = `You are the FounderOS MVP Scope Architect — a sharp, pragmatic product strategist whose job is to turn a validated startup idea into a ruthlessly scoped MVP plan.

## CONTEXT FROM IDEA VALIDATION:
- Venture Name: ${resolvedName}
- Startup Idea: ${resolvedIdea}
- Target User: ${resolvedAudience}
- Specific Problem: ${resolvedProblem}
- Current Alternatives / Workarounds: ${resolvedAlternatives}
- Pain Frequency & Intensity: ${resolvedPain}
- Core Differentiation / Wedge: ${resolvedDifferentiation}
- Evidence of Demand: ${resolvedEvidence}
- Idea Validation Score: ${scoreNumber}/100

## YOUR MISSION:
Ground your MVP scope strictly in these specific answers. Reference their actual problem, their actual target user, and their actual evidence. Never generate a generic MVP template.

${scoreNumber < 60 ? `Note: Validation score was on the lower side (${scoreNumber}/100)${weakestCategory ? `, particularly around ${weakestCategory}` : ''}. Scope this MVP provisionally to test the core assumption directly.` : ''}

Generate the MVP scope according to this EXACT specification:
1. Core Assumption to Test: The single riskiest assumption this MVP must prove (the specific belief that, if wrong, kills the idea).
2. Must-Have Features (v1 only): Cap at 3-6 items. Each feature MUST be formatted with its rationale: "Feature Name, because [specific reason why essential to test core assumption]".
3. Explicitly Excluded (Cut List): Features tempting to add but deferred to v2, explaining why each is cut.
4. Core User Flow: Step-by-step plain language path a real user takes from start to finish.
5. Build Estimate: Rough scope in days or weeks, flagging straightforward vs real engineering/design risk.
6. Success Metric: The single number that tells the founder whether the MVP worked, tied back to the validated pain.

Return ONLY valid JSON in this EXACT structure:
{
  "mvpName": "${resolvedName} Core MVP",
  "coreAssumption": "string",
  "mustHaveFeatures": ["Feature Name, because X (3 to 6 items)"],
  "coreFeatures": ["string (summary of primary capabilities)"],
  "niceToHaveFeatures": ["Feature Name — deferred reason"],
  "featuresToAvoid": ["Feature Name — why excluded from v1"],
  "cutList": [
    { "feature": "string", "reasonDeferred": "string" }
  ],
  "coreUserFlow": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "userJourney": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "buildEstimate": "2-3 weeks",
  "engineeringRisks": [
    { "component": "string", "riskLevel": "Low | Medium | High", "details": "string" }
  ],
  "technicalRequirements": ["string"],
  "developmentTimeline": [
    {
      "phase": "Phase 1: Foundation & Core Loop",
      "duration": "Days 1–4",
      "tasks": ["string"]
    }
  ],
  "successMetric": "string (single primary KPI)",
  "successMetrics": ["string"],
  "provisionalWarning": "${scoreNumber < 60 ? `Heads up — your validation score was ${scoreNumber}/100. This scope is provisional until further customer evidence is collected.` : ''}"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return {
      mvpName: data.mvpName || `${resolvedName} Core MVP`,
      coreAssumption: data.coreAssumption || `Target users will switch from ${resolvedAlternatives} if ${resolvedName} directly eliminates ${resolvedProblem}.`,
      mustHaveFeatures: Array.isArray(data.mustHaveFeatures) && data.mustHaveFeatures.length > 0
        ? data.mustHaveFeatures
        : [
            `Core Problem Intake, because ${resolvedAudience} needs zero-friction entry`,
            `Direct Resolution Engine, because it delivers the primary value proposition without manual intervention`,
            `Actionable Output Dashboard, because users need immediate proof of outcome`,
          ],
      coreFeatures: Array.isArray(data.coreFeatures) && data.coreFeatures.length > 0
        ? data.coreFeatures
        : [`Direct resolution engine for ${resolvedProblem}`, `Customer intake for ${resolvedAudience}`, 'Outcome delivery view'],
      niceToHaveFeatures: Array.isArray(data.niceToHaveFeatures) && data.niceToHaveFeatures.length > 0
        ? data.niceToHaveFeatures
        : ['Exportable summary reports — deferred to v1.1', 'Automated email webhooks — deferred to post-validation'],
      featuresToAvoid: Array.isArray(data.featuresToAvoid) && data.featuresToAvoid.length > 0
        ? data.featuresToAvoid
        : [
            'Complex multi-tenant permissions (delays first user signal)',
            'Premature automated billing tiers (validate willingness to pay manually first)',
            'Native mobile application wrappers (test web responsive first)',
          ],
      cutList: Array.isArray(data.cutList) && data.cutList.length > 0
        ? data.cutList
        : [
            { feature: 'Enterprise SSO & RBAC', reasonDeferred: 'Not required to test initial user activation' },
            { feature: 'Automated Billing Logic', reasonDeferred: 'Process early transactions manually via Stripe links' },
            { feature: 'Third-party integrations', reasonDeferred: 'Validate core workflow before building API connectors' },
          ],
      coreUserFlow: Array.isArray(data.coreUserFlow) && data.coreUserFlow.length > 0
        ? data.coreUserFlow
        : (Array.isArray(data.userJourney) && data.userJourney.length > 0
          ? data.userJourney
          : [
              `1. ${resolvedAudience} signs in and specifies their primary bottleneck.`,
              `2. System processes input and generates direct solution.`,
              `3. User receives and deploys validated output in under 2 minutes.`,
            ]),
      userJourney: Array.isArray(data.userJourney) && data.userJourney.length > 0
        ? data.userJourney
        : [`1. ${resolvedAudience} inputs requirements.`, `2. Core workflow executes.`, `3. Delivers output.`],
      buildEstimate: data.buildEstimate || '2 Weeks',
      engineeringRisks: Array.isArray(data.engineeringRisks) && data.engineeringRisks.length > 0
        ? data.engineeringRisks
        : [
            { component: 'Core Resolution Engine', riskLevel: 'Medium', details: 'Requires prompt precision and deterministic latency' },
            { component: 'User Session & Storage', riskLevel: 'Low', details: 'Standard MongoDB CRUD schemas' },
          ],
      technicalRequirements: Array.isArray(data.technicalRequirements) && data.technicalRequirements.length > 0
        ? data.technicalRequirements
        : ['React + TypeScript Frontend', 'Node.js Express API', 'MongoDB Persistence', 'Gemini AI Integration'],
      developmentTimeline: Array.isArray(data.developmentTimeline) && data.developmentTimeline.length > 0
        ? data.developmentTimeline
        : [
            { phase: 'Phase 1: Core Flow & Database', duration: 'Days 1–4', tasks: ['Database schemas', 'Auth middleware', 'Intake UI'] },
            { phase: 'Phase 2: Resolution Engine', duration: 'Days 5–9', tasks: [`Build core solution for ${resolvedProblem}`, 'Wire state store'] },
            { phase: 'Phase 3: End-to-End QA & Launch', duration: 'Days 10–14', tasks: ['Run 5 customer test loops', 'Deploy to production'] },
          ],
      successMetric: data.successMetric || `70% of test users complete the core loop and report relief from ${resolvedProblem}`,
      successMetrics: Array.isArray(data.successMetrics) && data.successMetrics.length > 0
        ? data.successMetrics
        : [`10 Active Target Users from ${resolvedAudience}`, '70% Core Task Completion Rate', '<2s Response Latency'],
      provisionalWarning: data.provisionalWarning || (scoreNumber < 60 ? `Heads up — your validation score was ${scoreNumber}/100. This scope is provisional until further customer evidence is collected.` : ''),
    };
  } catch (error) {
    console.error('Gemini MVP Scope Service Error:', error.message || error);
    return {
      mvpName: `${resolvedName} Core MVP`,
      coreAssumption: `Target users will switch from ${resolvedAlternatives} if ${resolvedName} directly eliminates ${resolvedProblem}.`,
      mustHaveFeatures: [
        `Core Problem Intake, because ${resolvedAudience} needs zero-friction entry`,
        `Direct Resolution Engine, because it delivers the primary value proposition without manual intervention`,
        `Actionable Output Dashboard, because users need immediate proof of outcome`,
      ],
      coreFeatures: [`Direct resolution engine for ${resolvedProblem}`, `Customer intake for ${resolvedAudience}`, 'Outcome delivery view'],
      niceToHaveFeatures: ['Exportable PDF reports — deferred to v1.1', 'Custom webhooks — deferred to post-validation'],
      featuresToAvoid: [
        'Complex multi-tenant permissions (delays first user signal)',
        'Premature automated billing tiers (validate willingness to pay manually first)',
        'Native mobile application wrappers (test web responsive first)',
      ],
      cutList: [
        { feature: 'Enterprise SSO & RBAC', reasonDeferred: 'Not required to test initial user activation' },
        { feature: 'Automated Billing Logic', reasonDeferred: 'Process early transactions manually via Stripe links' },
      ],
      coreUserFlow: [
        `1. ${resolvedAudience} signs in and specifies their primary bottleneck.`,
        `2. System processes input and generates direct solution.`,
        `3. User receives and deploys validated output in under 2 minutes.`,
      ],
      userJourney: [`1. ${resolvedAudience} inputs requirements.`, `2. Core workflow executes.`, `3. Delivers output.`],
      buildEstimate: '2 Weeks',
      engineeringRisks: [
        { component: 'Core Resolution Engine', riskLevel: 'Medium', details: 'Requires prompt precision and deterministic latency' },
        { component: 'User Session & Storage', riskLevel: 'Low', details: 'Standard MongoDB CRUD schemas' },
      ],
      technicalRequirements: ['React + TypeScript Frontend', 'Node.js Express Backend', 'MongoDB Persistence'],
      developmentTimeline: [
        { phase: 'Phase 1: Core Flow & Database', duration: 'Days 1–4', tasks: ['Database schemas', 'Auth middleware', 'Intake UI'] },
        { phase: 'Phase 2: Resolution Engine', duration: 'Days 5–9', tasks: [`Build core solution for ${resolvedProblem}`, 'Wire state store'] },
        { phase: 'Phase 3: QA & Launch', duration: 'Days 10–14', tasks: ['Run 5 customer test loops', 'Deploy to production'] },
      ],
      successMetric: `70% of test users complete the core loop and report relief from ${resolvedProblem}`,
      successMetrics: [`10 Active Target Users from ${resolvedAudience}`, '70% Task Completion Rate'],
      provisionalWarning: scoreNumber < 60 ? `Heads up — your validation score was ${scoreNumber}/100. This scope is provisional until further customer evidence is collected.` : '',
    };
  }
}

module.exports = {
  generateMvpScopeFromGemini,
};
