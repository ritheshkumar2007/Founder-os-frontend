const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate a complete Launch Sprint execution plan JSON via Gemini API using expert launch manager prompt.
 */
async function generateLaunchSprintFromGemini({ ventureName, idea, mvpScope, marketingPlan, launchDate, launchGoal, targetAudience }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }

  const prompt = `You are an expert startup launch manager.

Create a complete launch sprint execution plan.

Startup:
${ventureName || 'Untitled Venture'}

Idea:
${idea}

MVP:
${mvpScope || '2-week core MVP'}

Marketing Plan:
${marketingPlan || 'Direct outreach & Product Hunt launch'}

Launch Date:
${launchDate || '7 days from today'}

Launch Goal:
${launchGoal || 'Acquire first 100 active users'}

Target Audience:
${targetAudience || 'Early adopters & tech builders'}


Return ONLY valid JSON.


Generate:
1. Pre-launch plan
2. Launch day execution plan
3. Post-launch growth plan
4. Content publishing schedule
5. Community building strategy
6. User acquisition strategy
7. Launch metrics
8. Risk management plan

Create a realistic startup launch sprint.

Return valid JSON ONLY in this EXACT structure:
{
  "preLaunch": [
    {
      "day": "Day -3",
      "tasks": ["string"],
      "owner": "Founder",
      "objective": "string"
    }
  ],
  "launchDay": [
    {
      "time": "12:01 AM PST",
      "activity": "Publish Product Hunt launch page",
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
      "platform": "Product Hunt / Twitter / LinkedIn",
      "content": "string",
      "date": "Launch Day"
    }
  ],
  "communityStrategy": ["string"],
  "userAcquisitionPlan": ["string"],
  "launchMetrics": [
    {
      "metric": "Product Hunt Upvotes",
      "target": "300+"
    }
  ],
  "riskManagement": [
    {
      "risk": "Server crash under spike traffic",
      "solution": "Scale MongoDB Atlas tier & add Cloudflare caching"
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
      preLaunch: Array.isArray(data.preLaunch) && data.preLaunch.length > 0
        ? data.preLaunch
        : [
            { day: 'Day -3', tasks: ['Audit landing page headline & CTA', 'Test 1-click waitlist intake'], owner: 'Founder', objective: 'Verify conversion funnel' },
            { day: 'Day -1', tasks: ['Prepare Product Hunt maker comment & images', 'Draft email launch blast'], owner: 'Founder', objective: 'Finalize launch assets' },
          ],
      launchDay: Array.isArray(data.launchDay) && data.launchDay.length > 0
        ? data.launchDay
        : [
            { time: '12:01 AM PST', activity: 'Publish Product Hunt Maker Release Page', responsibility: 'Founder' },
            { time: '08:00 AM PST', activity: 'Send email blast to waitlist subscribers', responsibility: 'Growth Lead' },
            { time: '12:00 PM PST', activity: 'Post founder story thread on Twitter & LinkedIn', responsibility: 'Founder' },
          ],
      postLaunch: Array.isArray(data.postLaunch) && data.postLaunch.length > 0
        ? data.postLaunch
        : [
            { week: 'Week +1', actions: ['1-on-1 direct outreach to all commenters', 'Fix reported user bugs'], expectedResult: 'Convert 50 upvoters to active users' },
          ],
      contentSchedule: Array.isArray(data.contentSchedule) && data.contentSchedule.length > 0
        ? data.contentSchedule
        : [
            { platform: 'Product Hunt', content: 'Maker Story Comment: Why we built this OS', date: 'Launch Day' },
            { platform: 'LinkedIn', content: 'Personal Founder Journey & MVP teardown video', date: 'Launch Day' },
          ],
      communityStrategy: Array.isArray(data.communityStrategy) ? data.communityStrategy : ['Engage authentically in Indie Hackers', 'Share learnings on Reddit r/startups'],
      userAcquisitionPlan: Array.isArray(data.userAcquisitionPlan) ? data.userAcquisitionPlan : ['Direct LinkedIn 1-on-1 DMs', 'Product Hunt release', 'Referral viral credits'],
      launchMetrics: Array.isArray(data.launchMetrics) && data.launchMetrics.length > 0
        ? data.launchMetrics
        : [
            { metric: 'Product Hunt Upvotes', target: '300+ Upvotes' },
            { metric: 'New Active Signups', target: '100 Users' },
            { metric: 'Waitlist Conversion Rate', target: '25%' },
          ],
      riskManagement: Array.isArray(data.riskManagement) && data.riskManagement.length > 0
        ? data.riskManagement
        : [
            { risk: 'High server latency under traffic spike', solution: 'Enable auto-scaling on backend server & Cloudflare CDN' },
            { risk: 'Low initial upvote velocity', solution: 'Direct founder outreach to network & Slack communities' },
          ],
    };
  } catch (error) {
    console.error('Gemini Launch Sprint Service Error:', error.message || error);
    // Robust Launch Manager Fallback
    return {
      preLaunch: [
        { day: 'Day -5', tasks: ['Verify single high-converting CTA on landing page', 'Test sign-up intake'], owner: 'Founder', objective: 'Funnel Optimization' },
        { day: 'Day -3', tasks: ['Draft 3-part welcome email onboarding sequence', 'Prepare video demo'], owner: 'Founder', objective: 'Content Readiness' },
        { day: 'Day -1', tasks: ['Finalize Product Hunt maker comment & images', 'Notify beta supporters'], owner: 'Founder', objective: 'Launch Lock-in' },
      ],
      launchDay: [
        { time: '12:01 AM PST', activity: 'Go live on Product Hunt with maker comment', responsibility: 'Founder' },
        { time: '07:30 AM PST', activity: 'Send email blast to pre-registered waitlist', responsibility: 'Growth Lead' },
        { time: '10:00 AM PST', activity: 'Post building-in-public story thread on Twitter/X', responsibility: 'Founder' },
        { time: '02:00 PM PST', activity: 'Engage with all Product Hunt comments & questions', responsibility: 'Team' },
      ],
      postLaunch: [
        { week: 'Week +1', actions: ['Conduct 1-on-1 feedback interviews with first 20 active users', 'Deploy bug fixes'], expectedResult: 'Achieve 40% 7-day retention rate' },
        { week: 'Week +2', actions: ['Publish launch breakdown article on Indie Hackers & LinkedIn', 'Enable referral bonus'], expectedResult: 'Acquire 50 secondary referral signups' },
      ],
      contentSchedule: [
        { platform: 'Product Hunt', content: 'Maker Comment: How we built an AI Execution OS for founders', date: 'Launch Day' },
        { platform: 'Twitter / X', content: '10-tweet thread detailing 50 customer interviews & MVP learnings', date: 'Launch Day' },
        { platform: 'LinkedIn', content: 'Personal Founder Story: Stopping manual docs and building software', date: 'Launch Day' },
        { platform: 'Indie Hackers', content: 'Teardown: How we generated a complete launch sprint with AI', date: 'Launch Day + 2' },
      ],
      communityStrategy: [
        'Post transparent build-in-public updates on Indie Hackers & Reddit r/startups',
        'Engage 1-on-1 in Slack/Discord founder communities without spamming links',
        'Offer free 1-on-1 AI onboarding calls to community leaders',
      ],
      userAcquisitionPlan: [
        'Direct founder LinkedIn outreach to 50 target ICP profiles',
        'Product Hunt 12:01 AM PST launch campaign',
        'Referral incentive: 1 extra month of AI coach credits per invited founder',
      ],
      launchMetrics: [
        { metric: 'Product Hunt Upvotes', target: '250+ Upvotes' },
        { metric: 'First 7-Day Active Users', target: '100 Signups' },
        { metric: 'Waitlist Conversion', target: '30% Rate' },
        { metric: 'Customer Feedback Calls', target: '15 Interviews' },
      ],
      riskManagement: [
        { risk: 'Server latency under launch traffic', solution: 'Scale MongoDB Atlas instance & add Cloudflare edge caching' },
        { risk: 'Low launch day engagement', solution: 'Direct personal outreach to 30 close founder contacts' },
        { risk: 'Bugs reported by early adopters', solution: 'Reserve launch week purely for rapid patch deployments' },
      ],
    };
  }
}

module.exports = {
  generateLaunchSprintFromGemini,
};
