const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate MVP Scope JSON via Gemini API using expert product manager prompt.
 */
async function generateMvpScopeFromGemini({ ventureName, idea, targetUsers, problem }) {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBMWvuVTWm40C-GMMRCy203fx2F6iAYghQ';

  const prompt = `You are an expert startup product manager.

Analyze this startup idea and design a realistic MVP.

STARTUP DETAILS:
- Venture Name: ${ventureName || 'Untitled Venture'}
- Startup Idea: ${idea}
- Target Users: ${targetUsers}
- Problem Solved: ${problem}

Return ONLY valid JSON with NO additional surrounding text or markdown formatting.

Include:
1. MVP Name
2. Problem solved
3. Target users
4. Core MVP features
5. Must-have features
6. Nice-to-have features
7. Features to avoid
8. User journey
9. Technical requirements
10. Development timeline
11. Success metrics
12. Future roadmap

Return valid JSON ONLY in this EXACT structure:
{
  "mvpName": "string",
  "problemSolved": "string",
  "targetUsers": "string",
  "coreFeatures": ["string"],
  "mustHaveFeatures": ["string"],
  "niceToHaveFeatures": ["string"],
  "featuresToAvoid": ["string"],
  "userJourney": ["string"],
  "technicalRequirements": ["string"],
  "developmentTimeline": [
    {
      "phase": "Phase 1: Setup & Core Workflow",
      "duration": "Days 1-3",
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
      mvpName: data.mvpName || `${ventureName} MVP`,
      coreFeatures: Array.isArray(data.coreFeatures) ? data.coreFeatures : ['Core workflow engine', 'User signup & intake'],
      mustHaveFeatures: Array.isArray(data.mustHaveFeatures) ? data.mustHaveFeatures : ['User authentication', 'Dashboard view'],
      niceToHaveFeatures: Array.isArray(data.niceToHaveFeatures) ? data.niceToHaveFeatures : ['Dark mode toggle', 'PDF export'],
      featuresToAvoid: Array.isArray(data.featuresToAvoid) ? data.featuresToAvoid : ['Complex multi-tenant permissions', 'Custom billing rules'],
      userJourney: Array.isArray(data.userJourney) ? data.userJourney : ['Land on website', 'Input details', 'Receive value output'],
      technicalRequirements: Array.isArray(data.technicalRequirements) ? data.technicalRequirements : ['React Frontend', 'Express Backend', 'MongoDB Database', 'Gemini API'],
      developmentTimeline: Array.isArray(data.developmentTimeline) ? data.developmentTimeline : [
        { phase: 'Phase 1: Foundation', duration: 'Days 1-3', tasks: ['Database schema', 'Authentication'] },
        { phase: 'Phase 2: Core Feature', duration: 'Days 4-8', tasks: ['Core AI engine', 'UI Dashboard'] },
        { phase: 'Phase 3: Launch', duration: 'Days 9-14', tasks: ['QA & Deployment', 'User Onboarding'] },
      ],
      successMetrics: Array.isArray(data.successMetrics) ? data.successMetrics : ['100 Active Users', '50% Weekly Retention', 'Sub-3s Response Time'],
      futureRoadmap: Array.isArray(data.futureRoadmap) ? data.futureRoadmap : ['Enterprise SSO', 'Custom integrations', 'Mobile App'],
    };
  } catch (error) {
    console.error('Gemini MVP Scope Service Error:', error.message || error);
    // Graceful fallback
    return {
      mvpName: `${ventureName} Core MVP`,
      coreFeatures: ['1-Click Customer Intake', 'Automated AI Response Engine', 'Actionable Dashboard'],
      mustHaveFeatures: ['User session persistence', 'Responsive UI layout', 'Secure API endpoints'],
      niceToHaveFeatures: ['Custom notification toasts', 'Exportable PDF summary'],
      featuresToAvoid: ['Premature microservice refactoring', 'Complex native mobile wrappers'],
      userJourney: ['Discover product landing page', 'Submit problem details', 'View AI generated output'],
      technicalRequirements: ['Node.js & Express API', 'MongoDB Atlas', 'Gemini AI API Integration'],
      developmentTimeline: [
        { phase: 'Phase 1: Core Setup', duration: 'Days 1-3', tasks: ['Backend routes', 'Frontend UI scaffold'] },
        { phase: 'Phase 2: Product Build', duration: 'Days 4-9', tasks: ['AI service integration', 'User flow verification'] },
        { phase: 'Phase 3: Launch Sprint', duration: 'Days 10-14', tasks: ['Beta user testing', 'Production deployment'] },
      ],
      successMetrics: ['10 Initial Customer Interviews', '80% Feature Satisfaction', '<2s Page Load Time'],
      futureRoadmap: ['Team workspaces', 'Automated webhook triggers', 'Native iOS app'],
    };
  }
}

module.exports = {
  generateMvpScopeFromGemini,
};
