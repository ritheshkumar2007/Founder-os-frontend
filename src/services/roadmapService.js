const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Roadmap = require('../models/Roadmap');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

function getBaselinePhases() {
  const ts = Date.now();
  return [
    {
      id: `p-${ts}-1`,
      phase: 'Phase 1',
      title: 'Problem & Target Audience Definition',
      goal: 'Validate customer problem and define core target persona',
      tasks: [
        { id: `t-${ts}-1`, title: 'Draft Venture Brief & Core Problem Statement', description: 'Define the target customer and pain points in detail', estimatedTime: '1 day', dependencies: 'None', done: true },
        { id: `t-${ts}-2`, title: 'Identify Top 3 Competitors & Workarounds', description: 'Document current manual workarounds customer uses', estimatedTime: '1 day', dependencies: 'None', done: false },
      ],
    },
    {
      id: `p-${ts}-2`,
      phase: 'Phase 2',
      title: 'Customer Problem Validation',
      goal: 'Conduct 5-10 structured customer discovery interviews',
      tasks: [
        { id: `t-${ts}-3`, title: 'Reach Out to 25 Target ICP Contacts', description: 'Direct 1-on-1 outreach via LinkedIn / Email', estimatedTime: '2 days', dependencies: 'Phase 1', done: false },
        { id: `t-${ts}-4`, title: 'Log Interview Insights & Willingness-to-Pay', description: 'Document pain score and pricing feedback', estimatedTime: '3 days', dependencies: 'Reach Out', done: false },
      ],
    },
    {
      id: `p-${ts}-3`,
      phase: 'Phase 3',
      title: '2-Week Core MVP Build',
      goal: 'Build and deploy a functional minimal product solving core job',
      tasks: [
        { id: `t-${ts}-5`, title: 'Finalize Must-Have Features Scope', description: 'Cut non-essential features and isolate core value', estimatedTime: '1 day', dependencies: 'Phase 2', done: false },
        { id: `t-${ts}-6`, title: 'Deploy MVP Production Server & DB', description: 'Deploy core application logic and authentication', estimatedTime: '5 days', dependencies: 'Scope', done: false },
      ],
    },
    {
      id: `p-${ts}-4`,
      phase: 'Phase 4',
      title: 'Go-To-Market & First 100 Users',
      goal: 'Launch public sprint campaign to acquire early adopters',
      tasks: [
        { id: `t-${ts}-7`, title: 'Execute Product Hunt & Social Launch Sprint', description: 'Publish maker comment and launch thread', estimatedTime: '2 days', dependencies: 'Phase 3', done: false },
        { id: `t-${ts}-8`, title: 'Onboard First 20 Active Customers', description: 'Provide 1-on-1 onboarding and collect retention data', estimatedTime: '5 days', dependencies: 'Launch Sprint', done: false },
      ],
    },
  ];
}

async function generateRoadmap({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;
  const isDbConnected = mongoose.connection.readyState === 1;

  const memoryContext = buildFounderContextWindow(venture);
  let formattedPhases = null;

  if (apiKey && apiKey.trim()) {
    try {
      const prompt = `You are the Chief Technology Officer AI at FounderOS.
Generate a structured 4-phase technical & product execution roadmap.

VENTURE CONTEXT:
${memoryContext}

Return valid JSON ONLY in this EXACT structure:
{
  "phases": [
    {
      "id": "p-1",
      "phase": "Phase 1",
      "title": "string",
      "goal": "string",
      "tasks": [
        {
          "id": "t-1",
          "title": "string",
          "description": "string",
          "estimatedTime": "1 day",
          "dependencies": "None",
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
        formattedPhases = data.phases;
      }
    } catch (err) {
      console.warn('Roadmap AI generation fallback:', err.message);
    }
  }

  if (!formattedPhases || formattedPhases.length === 0) {
    formattedPhases = getBaselinePhases();
  }

  if (isDbConnected) {
    const existing = await Roadmap.findOne({ ventureId }).sort({ version: -1 }).catch(() => null);
    const version = existing ? existing.version + 1 : 1;
    if (existing) {
      existing.phases = formattedPhases;
      existing.version = version;
      await existing.save().catch(() => null);
      return existing;
    }
    return await Roadmap.create({
      ventureId,
      userId,
      phases: formattedPhases,
      version,
    }).catch(() => null);
  }

  return {
    ventureId,
    userId,
    phases: formattedPhases,
    version: 1,
  };
}

async function getRoadmapForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  const isDbConnected = mongoose.connection.readyState === 1;
  let doc = isDbConnected ? await Roadmap.findOne({ ventureId }).sort({ version: -1 }).catch(() => null) : null;
  if (!doc || !doc.phases || doc.phases.length === 0) {
    doc = await generateRoadmap({ venture: venture || { _id: ventureId }, userId });
  }
  return doc;
}

async function updateRoadmap(ventureId, userId, { phases }) {
  if (!ventureId || !userId) return null;
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    let doc = await Roadmap.findOne({ ventureId }).sort({ version: -1 }).catch(() => null);
    if (doc) {
      if (Array.isArray(phases)) doc.phases = phases;
      await doc.save().catch(() => null);
      return doc;
    } else {
      return await Roadmap.create({ ventureId, userId, phases: phases || [] }).catch(() => null);
    }
  }
  return { ventureId, userId, phases: phases || [] };
}

module.exports = { generateRoadmap, getRoadmapForVenture, updateRoadmap };
