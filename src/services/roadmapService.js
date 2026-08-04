const { GoogleGenerativeAI } = require('@google/generative-ai');
const Roadmap = require('../models/Roadmap');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

function getBaselinePhases() {
  const ts = Date.now();
  return [
    {
      id: `p-${ts}-1`,
      phase: 'Phase 1',
      title: 'Validation & Problem-Solution Fit',
      targetDuration: 'Days 1–3',
      tasks: [
        { id: `t-${ts}-1`, title: 'Conduct 5 Mom-Test customer interviews', owner: 'Founder', priority: 'HIGH', estimatedTime: '1 day', dependencies: 'None', done: true },
        { id: `t-${ts}-2`, title: 'Document top 3 customer pain workarounds', owner: 'Founder', priority: 'HIGH', estimatedTime: '1 day', dependencies: 'Interviews', done: true },
        { id: `t-${ts}-3`, title: 'Finalize value proposition & elevator pitch', owner: 'Founder', priority: 'MEDIUM', estimatedTime: '0.5 days', dependencies: 'Pain analysis', done: true },
      ],
    },
    {
      id: `p-${ts}-2`,
      phase: 'Phase 2',
      title: 'MVP Product Development',
      targetDuration: 'Days 4–9',
      tasks: [
        { id: `t-${ts}-4`, title: 'Build core automated workflow engine', owner: 'Tech Lead', priority: 'HIGH', estimatedTime: '3 days', dependencies: 'Validation', done: false },
        { id: `t-${ts}-5`, title: 'Design high-converting landing page UI', owner: 'Designer', priority: 'HIGH', estimatedTime: '2 days', dependencies: 'Value prop', done: false },
        { id: `t-${ts}-6`, title: 'Integrate database & user session memory', owner: 'Dev', priority: 'MEDIUM', estimatedTime: '2 days', dependencies: 'Workflow engine', done: false },
      ],
    },
    {
      id: `p-${ts}-3`,
      phase: 'Phase 3',
      title: 'Beta Launch & First 100 Users',
      targetDuration: 'Days 10–12',
      tasks: [
        { id: `t-${ts}-7`, title: 'Launch Product Hunt & LinkedIn campaign', owner: 'Growth Lead', priority: 'HIGH', estimatedTime: '1 day', dependencies: 'MVP Build', done: false },
        { id: `t-${ts}-8`, title: 'Direct 1-on-1 outreach to interview contacts', owner: 'Founder', priority: 'HIGH', estimatedTime: '1 day', dependencies: 'Landing Page', done: false },
      ],
    },
    {
      id: `p-${ts}-4`,
      phase: 'Phase 4',
      title: 'Traction & Monetization Growth',
      targetDuration: 'Days 13–14+',
      tasks: [
        { id: `t-${ts}-9`, title: 'Conduct willingness-to-pay pricing interviews', owner: 'Founder', priority: 'MEDIUM', estimatedTime: '2 days', dependencies: 'Beta Launch', done: false },
        { id: `t-${ts}-10`, title: 'Compile initial investor update memorandum', owner: 'Founder', priority: 'LOW', estimatedTime: '1 day', dependencies: 'Traction data', done: false },
      ],
    },
  ];
}

async function generateRoadmap({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;

  let formattedPhases = [];

  if (apiKey && apiKey.trim()) {
    try {
      const memoryContext = buildFounderContextWindow(venture);
      const history = await getConversationHistory({ userId, ventureId });
      const snippet = history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

      const prompt = `You are the Lead Startup Roadmap Architect at FounderOS.
Generate a structured 4-phase execution roadmap for this venture based STRICTLY on founder context.

STRICT PHASES:
- Phase 1: Validation & Problem-Solution Fit (Days 1–3)
- Phase 2: MVP Product Development (Days 4–9)
- Phase 3: Beta Launch & First 100 Users (Days 10–12)
- Phase 4: Traction & Monetization Growth (Days 13–14+)

VENTURE CONTEXT:
${memoryContext}

RECENT TRANSCRIPT:
${snippet}

Return valid JSON ONLY in this EXACT structure:
{
  "phases": [
    {
      "phase": "Phase 1",
      "title": "Validation & Problem-Solution Fit",
      "targetDuration": "Days 1–3",
      "tasks": [
        {
          "title": "string",
          "owner": "Founder",
          "priority": "HIGH|MEDIUM|LOW",
          "estimatedTime": "1 day",
          "dependencies": "string",
          "done": false
        }
      ]
    }
  ]
}`;

      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);

      if (Array.isArray(data.phases) && data.phases.length > 0) {
        formattedPhases = data.phases.map((p, pIdx) => ({
          id: `p-${Date.now()}-${pIdx}`,
          phase: p.phase || `Phase ${pIdx + 1}`,
          title: p.title || `Milestone ${pIdx + 1}`,
          targetDuration: p.targetDuration || `Days ${pIdx * 3 + 1}–${(pIdx + 1) * 3}`,
          tasks: (p.tasks || []).map((t, tIdx) => ({
            id: `t-${Date.now()}-${pIdx}-${tIdx}`,
            title: t.title || `Task ${tIdx + 1}`,
            owner: t.owner || 'Founder',
            priority: ['HIGH', 'MEDIUM', 'LOW'].includes(t.priority) ? t.priority : 'MEDIUM',
            estimatedTime: t.estimatedTime || '1 day',
            dependencies: t.dependencies || 'None',
            done: Boolean(t.done),
          })),
        }));
      }
    } catch (err) {
      console.warn('Roadmap AI generation fallback:', err.message);
    }
  }

  if (!formattedPhases || formattedPhases.length === 0) {
    formattedPhases = getBaselinePhases();
  }

  const existing = await Roadmap.findOne({ ventureId }).sort({ version: -1 });
  const version = existing ? existing.version + 1 : 1;

  let doc;
  if (existing) {
    existing.phases = formattedPhases;
    existing.version = version;
    await existing.save();
    doc = existing;
  } else {
    doc = await Roadmap.create({
      ventureId,
      userId,
      phases: formattedPhases,
      version,
    });
  }

  return doc;
}

async function getRoadmapForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  let doc = await Roadmap.findOne({ ventureId }).sort({ version: -1 });
  if ((!doc || !doc.phases || doc.phases.length === 0) && venture) {
    doc = await generateRoadmap({ venture, userId });
  }
  return doc;
}

async function updateRoadmap(ventureId, userId, { phases }) {
  if (!ventureId || !userId) return null;
  let doc = await Roadmap.findOne({ ventureId }).sort({ version: -1 });
  if (doc) {
    if (Array.isArray(phases)) doc.phases = phases;
    await doc.save();
    return doc;
  } else {
    return await Roadmap.create({ ventureId, userId, phases: phases || [] });
  }
}

module.exports = { generateRoadmap, getRoadmapForVenture, updateRoadmap };
