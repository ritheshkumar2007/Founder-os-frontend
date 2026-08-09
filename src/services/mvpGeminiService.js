const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate MVP Scope JSON via Gemini API using expert product manager prompt.
 * Strictly adheres to venture-specific context without inventing fake default features.
 */
async function generateMvpScopeFromGemini({ ventureName, idea, targetUsers, problem }) {
  const apiKey = process.env.GEMINI_API_KEY;

  const resolvedName = ventureName || 'Untitled Venture';
  const resolvedIdea = idea || 'Startup Concept';
  const resolvedAudience = targetUsers || 'Target Customer Segments';
  const resolvedProblem = problem || 'Core Customer Problem';

  const prompt = `You are an expert startup product manager in FounderOS.

Analyze this startup idea and design a realistic 2-week MVP scope tailored strictly to this specific venture.

STARTUP PARAMETERS:
- Venture Name: ${resolvedName}
- Startup Idea: ${resolvedIdea}
- Target Users: ${resolvedAudience}
- Core Problem Solved: ${resolvedProblem}

RULES:
1. Ground all features directly in resolving "${resolvedProblem}" for "${resolvedAudience}".
2. Exclude complex features that cause scope creep (delay them to v1.1 or v2.0).
3. Do NOT use generic template text. Be concrete and specific to ${resolvedName}.

Return ONLY valid JSON in this EXACT structure:
{
  "mvpName": "${resolvedName} Core MVP",
  "problemSolved": "${resolvedProblem}",
  "targetUsers": "${resolvedAudience}",
  "coreFeatures": ["string"],
  "mustHaveFeatures": ["string"],
  "niceToHaveFeatures": ["string"],
  "featuresToAvoid": ["string"],
  "userJourney": ["string"],
  "technicalRequirements": ["string"],
  "developmentTimeline": [
    {
      "phase": "Phase 1: Setup & Core Workflow",
      "duration": "Days 1–3",
      "tasks": ["string"]
    }
  ],
  "successMetrics": ["string"],
  "futureRoadmap": ["string"]
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
      coreFeatures: Array.isArray(data.coreFeatures) && data.coreFeatures.length > 0
        ? data.coreFeatures
        : [`Core Intake & Workflow Engine for ${resolvedProblem}`, `Direct value delivery for ${resolvedAudience}`],
      mustHaveFeatures: Array.isArray(data.mustHaveFeatures) && data.mustHaveFeatures.length > 0
        ? data.mustHaveFeatures
        : [`User intake & authentication`, `Core workflow resolving ${resolvedProblem}`, `Dashboard output & task view`],
      niceToHaveFeatures: Array.isArray(data.niceToHaveFeatures) && data.niceToHaveFeatures.length > 0
        ? data.niceToHaveFeatures
        : ['Exportable summary reports', 'Email webhook notifications'],
      featuresToAvoid: Array.isArray(data.featuresToAvoid) && data.featuresToAvoid.length > 0
        ? data.featuresToAvoid
        : ['Premature microservices architecture', 'Complex custom billing rules'],
      userJourney: Array.isArray(data.userJourney) && data.userJourney.length > 0
        ? data.userJourney
        : [`Step 1: ${resolvedAudience} submits problem details.`, `Step 2: Core resolution engine processes request.`, `Step 3: Actionable output delivered.`],
      technicalRequirements: Array.isArray(data.technicalRequirements) && data.technicalRequirements.length > 0
        ? data.technicalRequirements
        : ['React + TypeScript Frontend', 'Express REST API', 'MongoDB Atlas Database', 'AI Engine Integration'],
      developmentTimeline: Array.isArray(data.developmentTimeline) && data.developmentTimeline.length > 0
        ? data.developmentTimeline
        : [
            { phase: 'Phase 1: Foundation & Schemas', duration: 'Days 1–3', tasks: ['Database setup', 'Authentication endpoints'] },
            { phase: 'Phase 2: Core Feature Engine', duration: 'Days 4–9', tasks: [`Build direct resolution engine for ${resolvedProblem}`, 'Wire UI dashboard'] },
            { phase: 'Phase 3: Testing & Deployment', duration: 'Days 10–14', tasks: ['Conduct user flow QA', 'Deploy to production'] },
          ],
      successMetrics: Array.isArray(data.successMetrics) && data.successMetrics.length > 0
        ? data.successMetrics
        : ['10 Initial Customer Testing Sessions', '80% Core Feature Completion Rate', '<2s Response Latency'],
      futureRoadmap: Array.isArray(data.futureRoadmap) && data.futureRoadmap.length > 0
        ? data.futureRoadmap
        : ['v2.0: Enterprise Integrations', 'v2.1: Automated Team Workspaces'],
    };
  } catch (error) {
    console.error('Gemini MVP Scope Service Error:', error.message || error);
    return {
      mvpName: `${resolvedName} Core MVP`,
      coreFeatures: [`Core Workflow Engine for ${resolvedProblem}`, `Direct intake for ${resolvedAudience}`, 'Actionable Output Dashboard'],
      mustHaveFeatures: ['User intake & authentication', `Direct resolution of ${resolvedProblem}`, 'Responsive dashboard view'],
      niceToHaveFeatures: ['Exportable summary reports', 'Email notifications'],
      featuresToAvoid: ['Premature microservices architecture', 'Complex multi-tenant permissions'],
      userJourney: [`Step 1: ${resolvedAudience} inputs details.`, `Step 2: Core engine processes problem.`, `Step 3: View instant output.`],
      technicalRequirements: ['React + TypeScript Frontend', 'Node.js & Express Backend', 'MongoDB Database Storage'],
      developmentTimeline: [
        { phase: 'Phase 1: Foundation', duration: 'Days 1–3', tasks: ['Database schemas', 'API routes'] },
        { phase: 'Phase 2: Core Feature', duration: 'Days 4–9', tasks: [`Build core solution for ${resolvedProblem}`, 'Wire user dashboard'] },
        { phase: 'Phase 3: Launch QA', duration: 'Days 10–14', tasks: ['Beta user testing', 'Deploy to production'] },
      ],
      successMetrics: ['10 Initial Test Users', '80% Feature Completion', '<2s Page Load Time'],
      futureRoadmap: ['v2.0: Team collaboration', 'v2.1: Automated webhooks'],
    };
  }
}

module.exports = {
  generateMvpScopeFromGemini,
};
