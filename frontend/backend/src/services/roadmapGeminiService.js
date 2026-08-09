const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to generate a structured software development roadmap via Gemini API using expert CTO prompt.
 */
async function generateBuildRoadmapFromGemini({ ventureName, idea, mvpScope, users, stack }) {
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `You are an expert startup CTO and product manager.

Create a realistic software development roadmap for this startup.

Analyze:
Startup Name:
${ventureName || 'Untitled Venture'}

Startup Idea:
${idea}

MVP Scope:
${mvpScope || '2-week core MVP'}

Target Users:
${users || 'Early adopters'}

Technology Stack:
${stack || 'React, Node.js, Express, MongoDB Atlas, Gemini AI'}


Return ONLY valid JSON.


Generate:
1. Product development overview
2. Development phases (Phase 1: Foundation, Phase 2: Core MVP Development, Phase 3: Testing & Optimization, Phase 4: Launch Preparation)
3. For each phase include: timeline, objectives, development tasks, deliverables, required technologies
4. Team requirements
5. Development risks
6. Important milestones
7. Launch checklist
8. Future improvements

Return valid JSON ONLY in this EXACT structure:
{
  "overview": "string",
  "developmentPhases": [
    {
      "phaseName": "Phase 1: Foundation & Architecture",
      "duration": "Days 1–3",
      "objectives": "string",
      "tasks": ["string"],
      "deliverables": ["string"],
      "technologies": ["string"]
    }
  ],
  "teamRequirements": ["string"],
  "risks": ["string"],
  "milestones": ["string"],
  "launchChecklist": ["string"],
  "futureImprovements": ["string"]
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return {
      overview: data.overview || `Software development roadmap for ${ventureName}`,
      developmentPhases: Array.isArray(data.developmentPhases) && data.developmentPhases.length > 0
        ? data.developmentPhases
        : [
            {
              phaseName: 'Phase 1: Foundation',
              duration: 'Days 1-3',
              objectives: 'Set up architecture & database schemas',
              tasks: ['Setup repository', 'Database schemas', 'Auth middleware'],
              deliverables: ['Working API foundation', 'DB models'],
              technologies: ['Node.js', 'Express', 'MongoDB'],
            },
            {
              phaseName: 'Phase 2: Core MVP Development',
              duration: 'Days 4-9',
              objectives: 'Build core AI engine and dashboard UI',
              tasks: ['AI integration', 'Frontend components', 'State sync'],
              deliverables: ['Functional MVP', 'Interactive UI'],
              technologies: ['React', 'Vite', 'Gemini AI'],
            },
          ],
      teamRequirements: Array.isArray(data.teamRequirements) ? data.teamRequirements : ['1 Full-Stack Tech Lead', '1 Product Designer'],
      risks: Array.isArray(data.risks) ? data.risks : ['API Rate limits', 'Third-party latency'],
      milestones: Array.isArray(data.milestones) ? data.milestones : ['Architecture Approved', 'Core Build Demo', 'Beta Launch'],
      launchChecklist: Array.isArray(data.launchChecklist) ? data.launchChecklist : ['Security audit', 'Performance check', 'Analytics setup'],
      futureImprovements: Array.isArray(data.futureImprovements) ? data.futureImprovements : ['CI/CD Pipeline', 'Mobile Optimization'],
    };
  } catch (error) {
    console.error('Gemini Build Roadmap Service Error:', error.message || error);
    // Robust CTO Fallback
    return {
      overview: `Strategic 4-phase technical execution roadmap designed for ${ventureName}.`,
      developmentPhases: [
        {
          phaseName: 'Phase 1: Foundation & Architecture',
          duration: 'Days 1-3',
          objectives: 'Database schema, authentication, API routes setup',
          tasks: ['Initialize Git repository & Express API', 'Configure MongoDB Atlas schemas', 'Implement JWT auth & middleware'],
          deliverables: ['Production-ready backend server', 'Database connections', 'Base router endpoints'],
          technologies: ['Node.js', 'Express', 'MongoDB Atlas', 'JWT'],
        },
        {
          phaseName: 'Phase 2: Core MVP Development',
          duration: 'Days 4-9',
          objectives: 'Build AI service integration and interactive founder UI',
          tasks: ['Integrate Gemini AI prompt engine', 'Build dark glassmorphism dashboard', 'Connect state store to endpoints'],
          deliverables: ['Interactive MVP interface', 'Live AI generation engine'],
          technologies: ['React', 'Vite', 'TailwindCSS', 'Gemini API'],
        },
        {
          phaseName: 'Phase 3: Testing & Optimization',
          duration: 'Days 10-12',
          objectives: 'End-to-end integration testing & rate-limiting optimization',
          tasks: ['Conduct end-to-end user flow testing', 'Optimize response latency & caching', 'Audit mobile responsiveness'],
          deliverables: ['QA test pass report', 'Optimized build bundle'],
          technologies: ['Vite Build', 'Postman', 'Node CLI'],
        },
        {
          phaseName: 'Phase 4: Launch Preparation',
          duration: 'Days 13-14',
          objectives: 'Production deployment and Product Hunt release',
          tasks: ['Deploy backend server & frontend hosting', 'Verify SSL & CORS settings', 'Launch Product Hunt maker post'],
          deliverables: ['Live production app', 'Product Hunt release page'],
          technologies: ['Cloudflare / Render', 'GitHub Actions'],
        },
      ],
      teamRequirements: ['1 Full-Stack Engineer (Node + React)', '1 AI Product Lead'],
      risks: ['Underestimating Gemini API rate-limits during peak launch traffic', 'Scope creep on secondary cosmetic features'],
      milestones: ['Day 3: Backend API Verification', 'Day 9: Core MVP End-to-End Demo', 'Day 14: Public Launch'],
      launchChecklist: ['Verify environment variables (GEMINI_API_KEY)', 'Run automated build checks', 'Confirm CORS whitelist'],
      futureImprovements: ['Automated CI/CD deployment pipeline', 'Multi-tenant organization permissions', 'Real-time WebSocket updates'],
    };
  }
}

module.exports = {
  generateBuildRoadmapFromGemini,
};
