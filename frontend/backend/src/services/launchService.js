const { GoogleGenerativeAI } = require('@google/generative-ai');
const LaunchSprint = require('../models/LaunchSprint');
const { getConversationHistory, buildFounderContextWindow } = require('./memoryService');

function getDefaultCopy(ventureName) {
  const vName = ventureName || 'Our Venture';
  return {
    landingPage: `Headline: Turn Natural Founder Conversations Into Live Validation Roadmaps\nSubheadline: ${vName} builds your venture brief, 2-week MVP scope, and marketing plan automatically as you chat.\nCTA: Start Free Validation Sprint`,
    waitlist: `Join 500+ founders getting early access to ${vName}. Get your custom 2-week MVP roadmap in 60 seconds.`,
    emailSequence: `Subject: Welcome to ${vName} — Your 2-Week MVP Roadmap\n\nHey Founder — thanks for joining! Over the next 7 days, we'll help you turn your idea into a validated product without writing manual paperwork...`,
    productHunt: `Tagline: The AI Execution Operating System for Founders\n\nMaker Comment: Hi Product Hunt! We built ${vName} because early-stage founders spend 80% of their time writing docs instead of talking to customers...`,
    linkedIn: `🚀 Today we're launching ${vName}!\n\nAfter interviewing 50+ founders, we realized traditional business planning is dead. ${vName} uses Gemini AI to turn natural founder chats into live execution roadmaps...`,
    twitter: `1/ We just launched ${vName} on Product Hunt! 🧵\n\nWhy did we build an AI Execution OS for founders? Here's the story...`,
    reddit: `r/startups: How we validated our SaaS problem in 7 days before writing a single line of code (Learnings & Teardown)`,
    communities: `Indie Hackers post: How we built an AI Founder Coach that generates 2-week MVP roadmaps from natural conversations.`,
    firstHundred: `1-on-1 Outreach Script:\n"Hi [Name] — saw you're building in this space. We built ${vName} to help turn founder chats into 2-week MVP scopes. Would love to get your feedback!"`,
  };
}

function getDefaultChecklist() {
  return [
    { id: 'c1', category: 'Landing Page', title: 'Verify high-converting headline & single CTA button', done: true },
    { id: 'c2', category: 'Waitlist', title: 'Set up 1-click email waitlist intake & auto-reply', done: true },
    { id: 'c3', category: 'Email Sequence', title: 'Draft 3-part welcome & onboarding drip series', done: false },
    { id: 'c4', category: 'Product Hunt', title: 'Prepare maker comment & 12:01 AM PST launch assets', done: false },
    { id: 'c5', category: 'LinkedIn', title: 'Draft personal founder story & launch announcement post', done: false },
    { id: 'c6', category: 'Twitter/X', title: 'Prepare 5-tweet thread detailing problem discovery & MVP', done: false },
    { id: 'c7', category: 'Reddit', title: 'Identify 3 subreddits for authentic problem discussion', done: false },
    { id: 'c8', category: 'Communities', title: 'Draft value-first post for Indie Hackers & Slack groups', done: false },
    { id: 'c9', category: 'First 100 Users', title: 'Direct 1-on-1 outreach to 30 customer interview contacts', done: false },
  ];
}

async function generateLaunchSprint({ venture, userId }) {
  if (!venture || !userId) return null;
  const ventureId = venture._id;
  const apiKey = process.env.GEMINI_API_KEY;

  let checklist = [];
  let copyData = {};

  if (apiKey && apiKey.trim()) {
    try {
      const memoryContext = buildFounderContextWindow(venture);
      const history = await getConversationHistory({ userId, ventureId });
      const snippet = history.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

      const prompt = `You are the Launch Sprint Architect AI at FounderOS.
Generate a complete Launch Sprint package for this startup based STRICTLY on founder memory.

VENTURE CONTEXT:
${memoryContext}

RECENT TRANSCRIPT:
${snippet}

Return valid JSON ONLY in this EXACT structure:
{
  "checklist": [
    {
      "category": "Landing Page",
      "title": "string",
      "done": false
    }
  ],
  "copyData": {
    "landingPage": "string",
    "waitlist": "string",
    "emailSequence": "string",
    "productHunt": "string",
    "linkedIn": "string",
    "twitter": "string",
    "reddit": "string",
    "communities": "string",
    "firstHundred": "string"
  }
}`;

      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);

      if (Array.isArray(data.checklist) && data.checklist.length > 0) {
        checklist = data.checklist.map((c, idx) => ({
          id: `c-${Date.now()}-${idx}`,
          category: c.category || 'Launch',
          title: c.title || 'Execute launch item',
          done: Boolean(c.done),
        }));
      }

      if (data.copyData && typeof data.copyData === 'object') {
        copyData = data.copyData;
      }
    } catch (err) {
      console.warn('Launch sprint AI generation fallback:', err.message);
    }
  }

  if (!checklist || checklist.length === 0) {
    checklist = getDefaultChecklist();
  }

  const defaultCopy = getDefaultCopy(venture.ventureName || venture.name);
  copyData = {
    landingPage: copyData.landingPage || defaultCopy.landingPage,
    waitlist: copyData.waitlist || defaultCopy.waitlist,
    emailSequence: copyData.emailSequence || defaultCopy.emailSequence,
    productHunt: copyData.productHunt || defaultCopy.productHunt,
    linkedIn: copyData.linkedIn || defaultCopy.linkedIn,
    twitter: copyData.twitter || defaultCopy.twitter,
    reddit: copyData.reddit || defaultCopy.reddit,
    communities: copyData.communities || defaultCopy.communities,
    firstHundred: copyData.firstHundred || defaultCopy.firstHundred,
  };

  const existing = await LaunchSprint.findOne({ ventureId }).sort({ version: -1 });
  const version = existing ? existing.version + 1 : 1;

  let doc;
  if (existing) {
    existing.checklist = checklist;
    existing.copyData = copyData;
    existing.version = version;
    await existing.save();
    doc = existing;
  } else {
    doc = await LaunchSprint.create({
      ventureId,
      userId,
      checklist,
      copyData,
      version,
    });
  }

  return doc;
}

async function getLaunchSprintForVenture(ventureId, userId, venture) {
  if (!ventureId) return null;
  let doc = await LaunchSprint.findOne({ ventureId }).sort({ version: -1 });
  if ((!doc || !doc.checklist || doc.checklist.length === 0) && venture) {
    doc = await generateLaunchSprint({ venture, userId });
  }
  return doc;
}

async function updateLaunchSprint(ventureId, userId, { checklist, copyData }) {
  if (!ventureId || !userId) return null;
  let doc = await LaunchSprint.findOne({ ventureId }).sort({ version: -1 });
  if (doc) {
    if (Array.isArray(checklist)) doc.checklist = checklist;
    if (copyData) doc.copyData = copyData;
    await doc.save();
    return doc;
  } else {
    return await LaunchSprint.create({ ventureId, userId, checklist: checklist || [], copyData: copyData || {} });
  }
}

module.exports = { generateLaunchSprint, getLaunchSprintForVenture, updateLaunchSprint };
