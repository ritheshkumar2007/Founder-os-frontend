const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate a 10-part Marketing Strategy JSON via Gemini API using expert CMO prompt.
 */
async function generateMarketingPlanFromGemini({ ventureName, idea, mvpScope, audience, industry, pricing, goal }) {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';

  const prompt = `You are an expert startup marketing strategist.

Create a complete marketing plan for this startup.

Startup Name:
${ventureName || 'Untitled Venture'}

Idea:
${idea}

MVP:
${mvpScope || '2-week core MVP'}

Target Audience:
${audience || 'Early adopters'}

Industry:
${industry || 'B2B SaaS / Technology'}

Pricing Model:
${pricing || 'Freemium / Monthly Subscription'}

Launch Goal:
${goal || 'Acquire first 100 active users in 30 days'}


Return ONLY valid JSON.


Generate:
1. Brand positioning
2. Customer personas
3. Unique value proposition
4. Marketing channels
5. Content strategy
6. Launch campaign
7. Growth strategies
8. Marketing budget suggestion
9. Key performance metrics
10. 90 day marketing roadmap

Make the strategy realistic for an early-stage startup.

Return valid JSON ONLY in this EXACT structure:
{
  "brandPositioning": "string",
  "customerPersona": [
    {
      "name": "Alex - Tech Founder",
      "age": "28-35",
      "painPoints": "string",
      "needs": "string",
      "behavior": "string"
    }
  ],
  "valueProposition": "string",
  "marketingChannels": [
    {
      "channel": "LinkedIn Direct Outreach",
      "purpose": "1-on-1 ICP acquisition",
      "strategy": "string"
    }
  ],
  "contentStrategy": [
    {
      "platform": "X / Twitter",
      "contentType": "Build-in-public threads",
      "frequency": "Daily"
    }
  ],
  "launchCampaign": {
    "preLaunch": "string",
    "launchDay": "string",
    "postLaunch": "string"
  },
  "growthStrategies": ["string"],
  "budgetAllocation": {
    "Direct Outreach & Tools": "40%",
    "Content & Copywriting": "35%",
    "Community Growth": "25%"
  },
  "metricsToTrack": ["string"],
  "ninetyDayRoadmap": [
    {
      "month": "Month 1: Validation & Direct Reach",
      "goals": "string",
      "actions": ["string"]
    }
  ]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return {
      brandPositioning: data.brandPositioning || `Positioned as the premier AI Execution OS for ${ventureName}`,
      customerPersona: Array.isArray(data.customerPersona) && data.customerPersona.length > 0
        ? data.customerPersona
        : [
            {
              name: 'Alex - Technical Founder',
              age: '28–36',
              painPoints: 'Wasting 80% of time writing business docs instead of building product.',
              needs: 'Automated validation, instant 2-week MVP scope, and clear marketing roadmap.',
              behavior: 'Active on Twitter/X, Indie Hackers, Product Hunt, and Reddit r/startups.',
            },
          ],
      valueProposition: data.valueProposition || 'Turn natural founder chats into live execution roadmaps in seconds.',
      marketingChannels: Array.isArray(data.marketingChannels) && data.marketingChannels.length > 0
        ? data.marketingChannels
        : [
            { channel: 'LinkedIn 1-on-1 DMs', purpose: 'Acquire first 30 B2B beta users', strategy: 'Personalized problem inquiry messages to ICP targets.' },
            { channel: 'Product Hunt Launch', purpose: 'High-visibility community release', strategy: 'Schedule 12:01 AM launch with Maker story comment.' },
          ],
      contentStrategy: Array.isArray(data.contentStrategy) && data.contentStrategy.length > 0
        ? data.contentStrategy
        : [
            { platform: 'Twitter / X', contentType: 'Build-in-public threads & MVP teardowns', frequency: '5x / week' },
            { platform: 'LinkedIn', contentType: 'Founder journey posts & customer interview takeaways', frequency: '3x / week' },
          ],
      launchCampaign: data.launchCampaign || {
        preLaunch: 'Build waitlist landing page & tease MVP teardowns to 50 ICP contacts.',
        launchDay: 'Publish Product Hunt campaign, post LinkedIn founder story, send email blast.',
        postLaunch: 'Follow up 1-on-1 with all upvoters & commenters to convert to active users.',
      },
      growthStrategies: Array.isArray(data.growthStrategies) ? data.growthStrategies : ['Direct founder outreach', 'Referral viral loops', 'Build in public transparency'],
      budgetAllocation: data.budgetAllocation && typeof data.budgetAllocation === 'object' ? data.budgetAllocation : {
        'Direct Founder Outreach': '$0 (Organic)',
        'Product Hunt & Copywriting': '$150',
        'Community & Social Boosts': '$100',
      },
      metricsToTrack: Array.isArray(data.metricsToTrack) ? data.metricsToTrack : ['First 100 Signups', '40% Weekly Retention', '15 Customer Interview Calls'],
      ninetyDayRoadmap: Array.isArray(data.ninetyDayRoadmap) && data.ninetyDayRoadmap.length > 0
        ? data.ninetyDayRoadmap
        : [
            { month: 'Month 1: Early Beta & 30 Users', goals: 'Validate problem urgency with 30 active users', actions: ['Direct DMs', 'Product Hunt release'] },
            { month: 'Month 2: Content Drip & 100 Users', goals: 'Scale organic top-of-funnel', actions: ['Weekly Twitter threads', 'SEO articles'] },
            { month: 'Month 3: Monetization & Growth Loops', goals: 'Convert active users to paid customers', actions: ['Launch pricing tiers', 'Referral incentives'] },
          ],
    };
  } catch (error) {
    console.error('Gemini Marketing Plan Service Error:', error.message || error);
    // Robust CMO Fallback
    return {
      brandPositioning: `Positioned as the AI-powered execution operating system for early-stage founders building ${ventureName}.`,
      customerPersona: [
        {
          name: 'Sarah - Solo Builder & Founder',
          age: '26–38',
          painPoints: 'Struggling with marketing messaging, content strategy, and target channel selection.',
          needs: 'Done-for-you GTM strategy, customer personas, and structured 90-day marketing roadmap.',
          behavior: 'Daily user of Twitter/X, LinkedIn, Indie Hackers, and developer newsletters.',
        },
      ],
      valueProposition: 'Automates your complete Go-To-Market marketing strategy from a single founder conversation.',
      marketingChannels: [
        { channel: 'Direct Founder LinkedIn Outreach', purpose: 'Acquire first 30 ICP customers', strategy: 'Value-first DMs sharing problem learnings and 1-click access.' },
        { channel: 'Product Hunt Launch', purpose: 'Mass audience & backlinks', strategy: 'Coordinated Maker release with founder video teardown.' },
        { channel: 'Indie Hackers & Reddit', purpose: 'Organic community growth', strategy: 'Transparent build-in-public articles & revenue milestones.' },
      ],
      contentStrategy: [
        { platform: 'Twitter / X', contentType: 'Daily build-in-public threads & MVP scope breakdowns', frequency: 'Daily' },
        { platform: 'LinkedIn', contentType: 'Executive lessons, founder interviews, and GTM tips', frequency: '3x / week' },
        { platform: 'Email Drip', contentType: '3-part onboarding sequence detailing validation steps', frequency: 'Automated' },
      ],
      launchCampaign: {
        preLaunch: 'Publish high-converting landing page with 1-click waitlist intake & tease launch date.',
        launchDay: 'Go live on Product Hunt at 12:01 AM PST, send email blast to waitlist, post founder story on LinkedIn.',
        postLaunch: 'Conduct 1-on-1 feedback calls with early signups and convert testimonials into social proof.',
      },
      growthStrategies: [
        '1-on-1 direct founder sales outreach',
        'Incentivized founder referral loop (1 month free credits)',
        'Build-in-public transparency marketing on Twitter & LinkedIn',
      ],
      budgetAllocation: {
        'Organic Outreach & Direct DMs': '60% Effort ($0)',
        'Launch Assets & Copywriting': '25% ($150)',
        'Community & Social Ads': '15% ($100)',
      },
      metricsToTrack: [
        '100 First Active Signups',
        '30 Logged Customer Interviews',
        '15% Waitlist-to-Active Conversion Rate',
      ],
      ninetyDayRoadmap: [
        { month: 'Month 1: Initial Launch & First 30 Users', goals: 'Validate ICP messaging & acquire 30 active testers', actions: ['Direct LinkedIn DMs', 'Product Hunt Launch'] },
        { month: 'Month 2: Content Growth & 100 Users', goals: 'Establish organic search & social distribution', actions: ['Publish weekly threads', 'SEO keyword landing pages'] },
        { month: 'Month 3: Monetization & Viral Referral', goals: 'Activate paid subscriptions and viral referral loops', actions: ['Launch paid tiers', 'Enable 1-click referral invites'] },
      ],
    };
  }
}

module.exports = {
  generateMarketingPlanFromGemini,
};
