const https = require('https');

/**
 * Extract relevant Venture context based on the active workspace module
 */
const extractWorkspaceContext = (venture, workspace) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const customerVal = venture.ideaValidation?.customerValidation || {};
  const insights = venture.ideaValidation?.validationInsights || {};
  const mvp = venture.mvpScope || {};
  const mkt = venture.marketingPlan || {};
  const sprint = venture.launchSprint || {};
  const trac = venture.traction || {};
  const update = venture.investorUpdate || {};

  const ventureName = venture.ventureName || 'Unnamed Venture';
  const targetCustomer = brief.targetCustomer || 'Target Customer';
  const problem = brief.problem || 'Core Problem';

  switch (workspace) {
    case 'Idea Validation':
      return `
VENTURE WORKSPACE: Idea Validation
Venture Name: "${ventureName}"
Building: ${brief.building || 'N/A'}
Target Customer: ${targetCustomer}
Problem: ${problem}
Current Workaround: ${brief.currentWorkaround || 'N/A'}
Desired Outcome: ${brief.desiredOutcome || 'N/A'}
Total Customer Interviews: ${customerVal.interviews?.length || 0}
Validation Decision: ${insights.decision || 'Keep Validating'}
High Pain Count: ${insights.highPainCount || 0}, Would Pay Intent: ${insights.wouldPayCount || 0}
      `.trim();

    case 'MVP Scope':
      return `
VENTURE WORKSPACE: MVP Scope
Venture Name: "${ventureName}"
Core Problem: ${mvp.coreCustomerProblem || problem}
Main Job: ${mvp.mainCustomerJob || 'N/A'}
MVP Promise: ${mvp.mvpPromise || 'N/A'}
Build Target: ${mvp.buildTarget || 'Build a usable MVP in two weeks.'}
Must Have Features: ${mvp.mustHaveFeatures?.join(', ') || 'None defined'}
Excluded Features: ${mvp.excludedFeatures?.join(', ') || 'None defined'}
      `.trim();

    case 'Marketing Plan':
      return `
VENTURE WORKSPACE: Marketing Plan
Venture Name: "${ventureName}"
ICP: ${mkt.idealCustomerProfile || targetCustomer}
Positioning Statement: ${mkt.positioningStatement || 'N/A'}
Headline: ${mkt.landingPageHeadline || 'N/A'}
Launch Channels: ${mkt.launchChannels?.join(', ') || 'None configured'}
First 100 Users Strategy: ${mkt.first100UsersStrategy || 'N/A'}
      `.trim();

    case 'Launch Sprint':
      return `
VENTURE WORKSPACE: Launch Sprint
Venture Name: "${ventureName}"
Current Day: Day ${sprint.currentDay || 1} of 7
Overall Progress: ${sprint.overallProgress || 0}%
Tasks Completed: ${sprint.completedTasks || 0} / ${(sprint.completedTasks || 0) + (sprint.remainingTasks || 0)}
Success Goal: ${sprint.successGoal || 'Get 5 early users to try the product.'}
      `.trim();

    case 'Traction':
      return `
VENTURE WORKSPACE: Traction Dashboard
Venture Name: "${ventureName}"
Current Stage: ${trac.metrics?.currentTractionStage || 'Pre-Launch'}
People Contacted: ${trac.peopleContacted || 0}
Waitlist Signups: ${trac.waitlistSignups || 0}
MVP Users: ${trac.mvpUsers || 0}
Paying Users: ${trac.payingUsers || 0}
Monthly Revenue: $${trac.monthlyRevenue || 0}
Contact-to-User Conversion: ${trac.metrics?.contactToUserConversion || 0}%
User-to-Paying Conversion: ${trac.metrics?.userToPayingConversion || 0}%
      `.trim();

    case 'Investor Update':
      return `
VENTURE WORKSPACE: Investor Update
Venture Name: "${ventureName}"
Problem: ${update.problem || problem}
Solution: ${update.solution || 'N/A'}
Validation Evidence: ${update.validationEvidence || 'N/A'}
Traction Summary: ${update.tractionSummary || 'N/A'}
Next Milestone: ${update.nextMilestone || 'N/A'}
Funding Needed: ${update.fundingNeeded || 'Not specified'}
      `.trim();

    default:
      return `
VENTURE GENERAL SUMMARY
Venture Name: "${ventureName}"
Target Customer: ${targetCustomer}
Problem: ${problem}
Building: ${brief.building || 'N/A'}
Traction Stage: ${trac.metrics?.currentTractionStage || 'Pre-Launch'}
Monthly Revenue: $${trac.monthlyRevenue || 0}
      `.trim();
  }
};

/**
 * Call OpenAI API or generate intelligent contextual response
 */
const generateChatReply = async ({ venture, workspace, conversation = [], message }) => {
  const context = extractWorkspaceContext(venture, workspace);

  // If OPENAI_API_KEY is configured in .env, call OpenAI API
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    try {
      const messagesPayload = [
        {
          role: 'system',
          content: `You are FounderOS AI, an expert startup co-pilot helping founders validate, build, launch, and scale their ventures.\n\nACTIVE VENTURE CONTEXT:\n${context}\n\nProvide direct, actionable, concise advice tailored specifically to this founder's active workspace and metrics.`,
        },
        ...conversation.map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const requestData = JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 600,
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Length': Buffer.byteLength(requestData),
        },
      };

      const responseBody = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve(body));
        });
        req.on('error', (err) => reject(err));
        req.write(requestData);
        req.end();
      });

      const parsed = JSON.parse(responseBody);
      if (parsed.choices && parsed.choices[0]?.message?.content) {
        return parsed.choices[0].message.content.trim();
      }
    } catch (error) {
      console.warn('OpenAI API request failed, falling back to internal AI engine:', error.message);
    }
  }

  // Fallback intelligent contextual AI engine
  const ventureName = venture.ventureName || 'your venture';
  const brief = venture.ideaValidation?.ventureBrief || {};
  const targetCustomer = brief.targetCustomer || 'target customer';
  const problem = brief.problem || 'core problem';
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Hello! I am your FounderOS Co-pilot for "${ventureName}". I am currently tracking your active workspace: [${workspace || 'General'}]. How can I help you accelerate your launch today?`;
  }

  if (lowerMsg.includes('validate') || lowerMsg.includes('customer') || lowerMsg.includes('interview')) {
    const interviewCount = venture.ideaValidation?.customerValidation?.interviews?.length || 0;
    return `For "${ventureName}", you currently have ${interviewCount} recorded customer interviews for ${targetCustomer}. To strengthen your validation signal, focus your questions on how severely they experience "${problem}" and whether they currently spend money on workarounds.`;
  }

  if (lowerMsg.includes('mvp') || lowerMsg.includes('feature') || lowerMsg.includes('build')) {
    const mustHaves = venture.mvpScope?.mustHaveFeatures?.length || 0;
    return `Based on your MVP Scope for "${ventureName}", you have defined ${mustHaves} core must-have features aimed at solving "${problem}". Keep your 2-week build focused exclusively on these core features before adding secondary tools like analytics or admin portals.`;
  }

  if (lowerMsg.includes('marketing') || lowerMsg.includes('outreach') || lowerMsg.includes('channel')) {
    const channels = venture.marketingPlan?.launchChannels?.join(', ') || 'direct founder outreach and community posts';
    return `For marketing "${ventureName}", your top configured channels are: ${channels}. Focus on 1-on-1 direct outreach to ${targetCustomer} experiencing "${problem}" rather than broad paid ads at this stage.`;
  }

  if (lowerMsg.includes('traction') || lowerMsg.includes('revenue') || lowerMsg.includes('user')) {
    const stage = venture.traction?.metrics?.currentTractionStage || 'Pre-Launch';
    const revenue = venture.traction?.monthlyRevenue || 0;
    return `Your venture "${ventureName}" is currently at the **${stage}** stage with $${revenue} monthly revenue. To transition to the next stage, prioritize converting active MVP testers into paying commitments.`;
  }

  return `Regarding "${ventureName}" in the [${workspace || 'General'}] workspace: To address "${message}", align your immediate next step with your target customer (${targetCustomer}) and core problem (${problem}). Focus on completing your active Launch Sprint tasks to drive progress.`;
};

module.exports = {
  extractWorkspaceContext,
  generateChatReply,
};
