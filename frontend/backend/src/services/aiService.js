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

/**
 * 100-Point Idea Viability Score (IV-Score) Assessment Service
 * Evaluates startup idea across 5 objective pillars combining AI analysis and customer discovery metrics.
 */
const evaluateIdeaScore = async ({ venture }) => {
  const brief = venture.ideaValidation?.ventureBrief || {};
  const customerVal = venture.ideaValidation?.customerValidation || {};
  const interviews = customerVal.interviews || [];
  const ventureName = venture.ventureName || 'Your Venture';

  const building = brief.building || '';
  const targetCustomer = brief.targetCustomer || '';
  const problem = brief.problem || '';
  const currentWorkaround = brief.currentWorkaround || '';
  const desiredOutcome = brief.desiredOutcome || '';

  const totalInterviews = interviews.length;
  const highPainCount = interviews.filter((i) => i.painLevel === 'HIGH').length;
  const lowPainCount = interviews.filter((i) => i.painLevel === 'LOW').length;
  const willPayCount = interviews.filter((i) => i.wouldPay === 'YES').length;
  const maybePayCount = interviews.filter((i) => i.wouldPay === 'MAYBE').length;

  // Empirical confidence multiplier based on real interviews
  let interviewMultiplier = 0.85; // Baseline before any validation interviews
  if (totalInterviews > 0) {
    if (highPainCount >= 3 && willPayCount >= 2) {
      interviewMultiplier = 1.15;
    } else if (highPainCount >= 1 && (willPayCount >= 1 || maybePayCount >= 1)) {
      interviewMultiplier = 1.05;
    } else if (lowPainCount > totalInterviews / 2) {
      interviewMultiplier = 0.75;
    } else {
      interviewMultiplier = 0.95;
    }
  }

  // Base deterministic scoring per pillar
  let problemScore = 14;
  let payScore = 10;
  let distributionScore = 11;
  let moatScore = 8;
  let executionScore = 12;

  let problemReasoning = 'Problem defined in venture brief; further customer discovery will establish exact urgency.';
  let payReasoning = 'Monetization intent established; test pricing directly with target buyers.';
  let distributionReasoning = 'Identified initial beachhead audience; focus on organic 1-on-1 outreach channels.';
  let moatReasoning = 'Opportunity to build high switching costs and founder speed advantages.';
  let executionReasoning = 'Scope is actionable for a 7 to 14-day Minimum Viable Product.';

  const strengths = [];
  const risks = [];
  const recommendations = [];

  // Evaluate Problem Severity (Max 25)
  if (problem.length > 20 && targetCustomer.length > 5) {
    problemScore += 5;
  }
  if (highPainCount > 0) {
    problemScore = Math.min(25, problemScore + Math.min(6, highPainCount * 2));
    problemReasoning = `${highPainCount} customer interview(s) directly confirmed high severity for "${problem || 'this problem'}".`;
    strengths.push(`Confirmed acute pain point with ${highPainCount} target user(s).`);
  } else if (totalInterviews === 0) {
    risks.push('Zero customer interviews logged — problem severity remains an unverified hypothesis.');
    recommendations.push('Conduct at least 3 customer discovery interviews to validate pain severity.');
  }

  // Evaluate Willingness to Pay (Max 20)
  if (currentWorkaround.length > 10) {
    payScore += 3;
    strengths.push(`Identified active workaround (${currentWorkaround}), indicating existing demand.`);
  }
  if (willPayCount > 0) {
    payScore = Math.min(20, payScore + Math.min(7, willPayCount * 3));
    payReasoning = `${willPayCount} customer(s) stated direct willingness to pay for a dedicated solution.`;
    strengths.push(`${willPayCount} customer(s) explicitly confirmed willingness to pay.`);
  } else if (totalInterviews > 0 && willPayCount === 0) {
    risks.push('No interviewees have committed to paying yet; risk of building a "nice-to-have" tool.');
    recommendations.push('Ask target users in interviews what they currently budget for workarounds.');
  }

  // Evaluate Distribution & Acquisition (Max 20)
  if (targetCustomer.length > 15) {
    distributionScore += 4;
    distributionReasoning = `Specific niche customer segment (${targetCustomer}) enables targeted outreach.`;
  } else {
    risks.push('Target customer profile is broad; broad audiences increase customer acquisition costs.');
    recommendations.push('Narrow your beachhead audience to a specific role, industry, or company stage.');
  }

  // Evaluate Unfair Advantage & Moat (Max 15)
  if (building.length > 15 && desiredOutcome.length > 15) {
    moatScore += 3;
  }

  // Evaluate Execution Speed (Max 20)
  if (building.length > 0) {
    executionScore += 3;
  }

  // Default recommendations if list is short
  if (recommendations.length === 0) {
    recommendations.push('Ship a 7-day MVP to test customer activation.');
    recommendations.push('Set up direct 1-on-1 demos with early interviewees.');
    recommendations.push('Secure 3 letter-of-intent (LOI) pre-commitments.');
  }
  if (strengths.length === 0) {
    strengths.push('Clear problem-solution orientation outlined in the venture brief.');
  }
  if (risks.length === 0) {
    risks.push('Early-stage market assumptions require continued customer feedback iteration.');
  }

  // Try calling Gemini AI for deep evaluation if GEMINI_API_KEY is present
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a world-class startup investor and Y Combinator style partner evaluating startup idea viability on a 100-point scale.
Evaluate this venture strictly and objectively across 5 pillars:

VENTURE DETAILS:
- Name: "${ventureName}"
- What they are building: "${building}"
- Target Customer: "${targetCustomer}"
- Core Problem: "${problem}"
- Current Workaround: "${currentWorkaround}"
- Desired Outcome: "${desiredOutcome}"
- Customer Discovery Interviews: ${totalInterviews} logged (${highPainCount} High Pain, ${lowPainCount} Low Pain, ${willPayCount} Willing to Pay)

SCORING CRITERIA (100 Points Total):
1. problemSeverity (Max 25): Urgency, pain severity, cost of doing nothing.
2. willingnessToPay (Max 20): Budget availability, commercial intent, existing workaround spend.
3. distribution (Max 20): Ease of finding and acquiring customers cheaply (B2B outreach, community, SEO).
4. unfairAdvantage (Max 15): Differentiation, switching costs, founder moat vs incumbents.
5. executionSpeed (Max 20): Feasibility of shipping a testable MVP in 7-14 days.

Return ONLY valid JSON matching this exact structure:
{
  "problemSeverity": { "score": number (0-25), "reasoning": "string" },
  "willingnessToPay": { "score": number (0-20), "reasoning": "string" },
  "distribution": { "score": number (0-20), "reasoning": "string" },
  "unfairAdvantage": { "score": number (0-15), "reasoning": "string" },
  "executionSpeed": { "score": number (0-20), "reasoning": "string" },
  "strengths": ["string", "string", "string"],
  "risks": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleaned);

      if (aiData.problemSeverity && aiData.willingnessToPay) {
        problemScore = Math.min(25, Math.max(0, Number(aiData.problemSeverity.score) || problemScore));
        problemReasoning = aiData.problemSeverity.reasoning || problemReasoning;

        payScore = Math.min(20, Math.max(0, Number(aiData.willingnessToPay.score) || payScore));
        payReasoning = aiData.willingnessToPay.reasoning || payReasoning;

        distributionScore = Math.min(20, Math.max(0, Number(aiData.distribution.score) || distributionScore));
        distributionReasoning = aiData.distribution.reasoning || distributionReasoning;

        moatScore = Math.min(15, Math.max(0, Number(aiData.unfairAdvantage.score) || moatScore));
        moatReasoning = aiData.unfairAdvantage.reasoning || moatReasoning;

        executionScore = Math.min(20, Math.max(0, Number(aiData.executionSpeed.score) || executionScore));
        executionReasoning = aiData.executionSpeed.reasoning || executionReasoning;

        if (Array.isArray(aiData.strengths) && aiData.strengths.length > 0) strengths.splice(0, strengths.length, ...aiData.strengths);
        if (Array.isArray(aiData.risks) && aiData.risks.length > 0) risks.splice(0, risks.length, ...aiData.risks);
        if (Array.isArray(aiData.recommendations) && aiData.recommendations.length > 0) recommendations.splice(0, recommendations.length, ...aiData.recommendations);
      }
    } catch (aiErr) {
      console.warn('Gemini AI idea scoring evaluation error, utilizing empirical scoring engine:', aiErr.message);
    }
  }

  // Calculate raw sum & weighted final score
  const rawSum = problemScore + payScore + distributionScore + moatScore + executionScore;
  const overallScore = Math.min(100, Math.max(15, Math.round(rawSum * interviewMultiplier)));

  let tier = 'Early Stage';
  if (overallScore >= 85) tier = 'Exceptional';
  else if (overallScore >= 70) tier = 'Promising';
  else if (overallScore >= 50) tier = 'Early Stage';
  else tier = 'High Risk';

  return {
    overallScore,
    tier,
    pillars: {
      problemSeverity: { score: problemScore, max: 25, reasoning: problemReasoning },
      willingnessToPay: { score: payScore, max: 20, reasoning: payReasoning },
      distribution: { score: distributionScore, max: 20, reasoning: distributionReasoning },
      unfairAdvantage: { score: moatScore, max: 15, reasoning: moatReasoning },
      executionSpeed: { score: executionScore, max: 20, reasoning: executionReasoning },
    },
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    interviewMultiplier: Number(interviewMultiplier.toFixed(2)),
    lastCalculatedAt: new Date(),
  };
};

module.exports = {
  extractWorkspaceContext,
  generateChatReply,
  evaluateIdeaScore,
};

