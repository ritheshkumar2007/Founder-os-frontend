const { GoogleGenerativeAI } = require('@google/generative-ai');
const WeeklyReview = require('../models/WeeklyReview');
const ExecutionTask = require('../models/ExecutionTask');
const ValidationReport = require('../models/ValidationReport');
const { calculatePillarProgress } = require('./progressService');
const { buildFounderContextWindow } = require('./memoryService');

/**
 * AI Weekly Review Engine
 * Generates an executive summary of completed work, outstanding risks, and next priorities.
 */
async function generateWeeklyReview({ ventureId, userId, venture }) {
  if (!ventureId || !userId) return null;

  const apiKey = process.env.GEMINI_API_KEY;

  const pillarProgress = await calculatePillarProgress(ventureId);
  const tasks = await ExecutionTask.find({ ventureId });
  const validationDoc = await ValidationReport.findOne({ ventureId }).sort({ version: -1 });

  const doneTasks = tasks.filter((t) => t.status === 'Done');
  const pendingTasks = tasks.filter((t) => t.status !== 'Done');

  const doneListStr = doneTasks.length > 0 ? doneTasks.map((t) => `- ${t.title}`).join('\n') : '- No tasks marked done yet.';
  const pendingListStr = pendingTasks.length > 0 ? pendingTasks.map((t) => `- ${t.title} (${t.priority} priority)`).join('\n') : '- No pending tasks.';

  let completedSummary = `Completed ${doneTasks.length} tasks out of ${tasks.length} total tasks.`;
  let outstandingRisks = validationDoc?.risks && validationDoc.risks.length > 0 ? validationDoc.risks : ['Building without sufficient customer interview proof.'];
  let nextPriorities = pendingTasks.slice(0, 3).map((t) => t.title);

  if (nextPriorities.length === 0) {
    nextPriorities = ['Interview 5 prospective customers', 'Finalize 2-week MVP scope', 'Draft landing page headline'];
  }

  if (apiKey && apiKey.trim()) {
    try {
      const memoryContext = buildFounderContextWindow(venture);
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const reviewPrompt = `You are the FounderOS Executive Weekly Review Synthesizer.
Analyze the completed startup tasks, pending tasks, and risk profile to generate a high-level executive weekly summary.

COMPLETED TASKS THIS WEEK:
${doneListStr}

PENDING TASKS & PRIORITIES:
${pendingListStr}

VENTURE CONTEXT:
${memoryContext}

Return valid JSON ONLY in this EXACT structure:
{
  "completedSummary": "string summarizing key achievements this week",
  "outstandingRisks": ["string (1-3 top risks)"],
  "nextPriorities": ["string (1-3 top priorities for next week)"]
}`;

      const result = await model.generateContent(reviewPrompt);
      const text = result.response.text();
      const cleanJsonText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);

      if (parsed.completedSummary) completedSummary = parsed.completedSummary;
      if (Array.isArray(parsed.outstandingRisks) && parsed.outstandingRisks.length > 0) outstandingRisks = parsed.outstandingRisks;
      if (Array.isArray(parsed.nextPriorities) && parsed.nextPriorities.length > 0) nextPriorities = parsed.nextPriorities;
    } catch (err) {
      console.warn('AI Weekly Review generation fallback:', err.message);
    }
  }

  // Create or update current week's review
  const latestReview = await WeeklyReview.findOne({ ventureId }).sort({ weekNumber: -1 });
  const weekNumber = latestReview ? latestReview.weekNumber + 1 : 1;

  const reviewDoc = await WeeklyReview.create({
    ventureId,
    userId,
    weekNumber,
    completedSummary,
    outstandingRisks,
    nextPriorities,
    pillarProgress,
  });

  return reviewDoc;
}

/**
 * Get latest weekly review for a venture
 */
async function getLatestWeeklyReview(ventureId, userId, venture) {
  if (!ventureId) return null;
  let review = await WeeklyReview.findOne({ ventureId }).sort({ weekNumber: -1 });
  if (!review && venture) {
    review = await generateWeeklyReview({ ventureId, userId, venture });
  }
  return review;
}

module.exports = {
  generateWeeklyReview,
  getLatestWeeklyReview,
};
