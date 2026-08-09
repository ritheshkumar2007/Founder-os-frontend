const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate a venture-aware, evidence-based Launch Sprint execution plan JSON
 * via Gemini API adhering strictly to FounderOS Launch Sprint rules.
 */
async function generateLaunchSprintFromGemini({
  ventureName,
  idea,
  mvpScope,
  marketingPlan,
  launchDate,
  launchGoal,
  targetAudience,
  customerEvidence,
  mvpReadiness,
}) {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';

  const hasRealLaunchDate = launchDate && launchDate.trim() && launchDate !== 'Not set' && !launchDate.toLowerCase().includes('7 days');
  const launchDateLabel = hasRealLaunchDate ? launchDate : 'Launch date: Not set';

  const prompt = `You are the Launch Sprint Agent inside FounderOS.
Your job is to turn the user's actual venture context into a practical, evidence-based launch execution plan.

=== VENTURE CONTEXT & WORKFLOW INPUTS ===
- Venture Name: ${ventureName || 'Untitled Venture'}
- Startup Idea: ${idea}
- Target Audience: ${targetAudience}
- MVP Scope: ${mvpScope}
- Marketing Plan Channels: ${marketingPlan}
- Launch Date: ${launchDateLabel}
- Launch Goal / Target: ${launchGoal || 'Launch target: Not defined'}
- Recorded Customer Evidence: ${customerEvidence || 'Customer interview evidence: Not yet recorded.'}
- MVP Readiness Status: ${mvpReadiness || 'Not ready'}

=== CRITICAL LAUNCH SPRINT RULES ===
1. NEVER INVENT FACTS: Do NOT invent launch dates, times, timezones ("12:01 AM PST"), interview counts, traction numbers, conversion rates, completed work, or customer quotes that are not in the context above.
2. LAUNCH DATE RULE: If launch date is "Not set", display "Launch date: Not set". Do NOT invent "In 7 Days", "Next Friday", or T-minus countdown dates. Use "Pre-Launch Tasks" instead of fake countdown dates.
3. METRIC RULE: Separate FACTS from GOALS. If a goal exists, label it "Founder-defined launch target". If AI recommends a goal, label it "Suggested launch target: 20–50 initial users" (clearly labeled "Suggested"). If missing, use "Launch target: Not defined".
4. CUSTOMER EVIDENCE RULE: Use actual recorded evidence ("${customerEvidence}"). Never claim "After 50 customer interviews" unless that fact actually exists.
5. COMPLETED WORK RULE: Do not pretend tasks are completed unless confirmed. Classify tasks as Completed, In Progress, Not Started, Blocked, or Recommended.
6. CONTENT & ACQUISITION PLAN RULE: Use channels strictly from the provided Marketing Plan ("${marketingPlan}"). Do NOT automatically add Product Hunt, Twitter/X, LinkedIn, Reddit, unless supported by the Marketing Plan or venture context.
7. MVP READINESS CHECK: If MVP readiness is "Not ready", set launch status to "Not ready" and identify key blockers before public launch.
8. END WITH ONE NEXT ACTION: End the entire plan with ONE specific, concrete action: "Next Action: ...".

Return ONLY valid JSON with NO markdown formatting around it in this EXACT structure:
{
  "launchOverview": {
    "ventureName": "${ventureName || 'Untitled Venture'}",
    "currentStage": "Early-Stage Execution",
    "launchObjective": "string (labeled Founder-defined target OR Suggested launch target)",
    "launchDate": "${launchDateLabel}",
    "launchStatus": "${mvpReadiness.includes('Not ready') ? 'Not ready (MVP incomplete)' : 'Ready for launch testing'}",
    "customerEvidence": "${customerEvidence}"
  },
  "preLaunch": [
    {
      "day": "Pre-Launch Task",
      "tasks": ["string"],
      "owner": "Founder",
      "status": "Not Started | Recommended | In Progress | Blocked",
      "reason": "string"
    }
  ],
  "launchDay": [
    {
      "time": "Launch Day Priorities",
      "activity": "string",
      "responsibility": "Founder"
    }
  ],
  "postLaunch": [
    {
      "week": "Week +1",
      "actions": ["string"],
      "expectedResult": "string"
    }
  ],
  "contentSchedule": [
    {
      "platform": "string (strictly from Marketing Plan)",
      "content": "string",
      "date": "Launch Day"
    }
  ],
  "communityStrategy": ["string"],
  "userAcquisitionPlan": ["string"],
  "launchMetrics": [
    {
      "metric": "string",
      "target": "string (labeled Founder-defined target OR Suggested launch target)"
    }
  ],
  "riskManagement": [
    {
      "risk": "string (venture-specific)",
      "solution": "string"
    }
  ],
  "nextAction": "Next Action: [ONE concrete action only]"
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return formatLaunchSprintData(data, {
      ventureName,
      idea,
      marketingPlan,
      launchDateLabel,
      launchGoal,
      customerEvidence,
      mvpReadiness,
    });
  } catch (error) {
    console.error('Gemini Launch Sprint Service Error:', error.message || error);
    return formatLaunchSprintData({}, {
      ventureName,
      idea,
      marketingPlan,
      launchDateLabel,
      launchGoal,
      customerEvidence,
      mvpReadiness,
    });
  }
}

/**
 * Format and sanitize Launch Sprint output according to evidence-based rules
 */
function formatLaunchSprintData(data, ctx) {
  const channelList = ctx.marketingPlan && ctx.marketingPlan !== 'Marketing Plan has not been defined yet.'
    ? ctx.marketingPlan
    : 'Direct target user outreach & community channels';

  const preLaunch = (Array.isArray(data.preLaunch) && data.preLaunch.length > 0)
    ? data.preLaunch
    : [
        {
          day: ctx.launchDateLabel.includes('Not set') ? 'Pre-Launch Task 1' : 'T-5 Days',
          tasks: ['Complete MVP testing & user flow verification', 'Test onboarding intake with 5–10 test users'],
          owner: 'Founder',
          status: 'Recommended',
          reason: 'Ensure core value delivery works before public exposure.',
        },
        {
          day: ctx.launchDateLabel.includes('Not set') ? 'Pre-Launch Task 2' : 'T-2 Days',
          tasks: ['Prepare feedback collection form', 'Setup error telemetry & analytics'],
          owner: 'Founder',
          status: 'Not Started',
          reason: 'Capture early user retention signals.',
        },
      ];

  const launchDay = (Array.isArray(data.launchDay) && data.launchDay.length > 0)
    ? data.launchDay
    : [
        {
          time: 'Launch Day Priorities',
          activity: `Publish launch announcement on primary channel (${channelList.split('|')[0] || channelList})`,
          responsibility: 'Founder',
        },
        {
          time: 'Launch Day Priorities',
          activity: 'Direct 1-on-1 outreach to pre-identified target users',
          responsibility: 'Founder',
        },
      ];

  const postLaunch = (Array.isArray(data.postLaunch) && data.postLaunch.length > 0)
    ? data.postLaunch
    : [
        {
          week: 'Week +1',
          actions: ['Conduct 1-on-1 feedback interviews with active test users', 'Deploy rapid bug patches'],
          expectedResult: 'Verify if test users repeatedly use the product.',
        },
      ];

  const contentSchedule = (Array.isArray(data.contentSchedule) && data.contentSchedule.length > 0)
    ? data.contentSchedule
    : [
        {
          platform: channelList.split('|')[0] || 'Target Channel',
          content: `Launch Announcement: Introducing ${ctx.ventureName || 'our startup'} for target users`,
          date: 'Launch Day',
        },
      ];

  const communityStrategy = (Array.isArray(data.communityStrategy) && data.communityStrategy.length > 0)
    ? data.communityStrategy
    : [`Engage directly in target communities where ${ctx.idea || 'target users'} seek solutions.`];

  const userAcquisitionPlan = (Array.isArray(data.userAcquisitionPlan) && data.userAcquisitionPlan.length > 0)
    ? data.userAcquisitionPlan
    : [`Direct outreach based on Marketing Plan channels: ${channelList}`];

  const launchMetrics = (Array.isArray(data.launchMetrics) && data.launchMetrics.length > 0)
    ? data.launchMetrics
    : [
        {
          metric: 'Initial Test Users',
          target: ctx.launchGoal && ctx.launchGoal !== 'Launch target: Not defined'
            ? `Founder-defined launch target: ${ctx.launchGoal}`
            : 'Suggested launch target: 20–50 initial users',
        },
        {
          metric: 'Core Workflow Completion Rate',
          target: 'Suggested launch target: 60% activation rate',
        },
      ];

  const riskManagement = (Array.isArray(data.riskManagement) && data.riskManagement.length > 0)
    ? data.riskManagement
    : [
        {
          risk: 'Low activation or user drop-off',
          solution: 'Conduct direct 1-on-1 feedback sessions to identify onboarding friction.',
        },
        {
          risk: 'Weak product-market signal',
          solution: 'Iterate core MVP feature based strictly on customer validation quotes.',
        },
      ];

  const nextAction = data.nextAction || `Next Action: Complete MVP core testing with 5–10 target users.`;

  return {
    preLaunch,
    launchDay,
    postLaunch,
    contentSchedule,
    communityStrategy,
    userAcquisitionPlan,
    launchMetrics,
    riskManagement,
    nextAction,
    launchOverview: data.launchOverview || {
      ventureName: ctx.ventureName || 'Untitled Venture',
      currentStage: 'Early-Stage Execution',
      launchObjective: ctx.launchGoal && ctx.launchGoal !== 'Launch target: Not defined'
        ? `Founder-defined launch target: ${ctx.launchGoal}`
        : 'Suggested launch target: Acquire 20–50 initial test users',
      launchDate: ctx.launchDateLabel,
      launchStatus: ctx.mvpReadiness.includes('Not ready') ? 'Not ready (MVP incomplete)' : 'Ready for launch testing',
      customerEvidence: ctx.customerEvidence,
    },
  };
}

module.exports = {
  generateLaunchSprintFromGemini,
};
