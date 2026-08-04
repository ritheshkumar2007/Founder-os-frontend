const Conversation = require('../models/Conversation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Save a message to the Conversation MongoDB collection
 */
async function saveMessage({ userId, ventureId, role, content }) {
  if (!userId || !ventureId || !role || !content) return null;
  return await Conversation.create({
    userId,
    ventureId,
    role,
    content: String(content).trim(),
    timestamp: new Date(),
  });
}

/**
 * Get chronological conversation history for a venture and user
 */
async function getConversationHistory({ userId, ventureId }) {
  if (!userId || !ventureId || require('mongoose').connection.readyState !== 1) return [];
  try {
    const pastMessages = await Conversation.find({ userId, ventureId }).sort({ timestamp: 1 });
    return pastMessages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Builds a comprehensive context window summarizing saved startup parameters
 */
function buildFounderContextWindow(venture) {
  if (!venture) {
    return 'NO_SAVED_VENTURE_CONTEXT';
  }

  const brief = venture.ideaValidation?.ventureBrief || {};
  const mvp = venture.mvpScope || {};
  const mkt = venture.marketingPlan || {};
  const inv = venture.investorUpdate || {};

  const name = venture.ventureName || 'Unnamed Venture';
  const customer = brief.targetCustomer || mkt.idealCustomerProfile || inv.targetCustomer || 'Not specified yet';
  const problem = brief.problem || mvp.coreCustomerProblem || inv.problem || 'Not specified yet';
  const solution = brief.building || mvp.mvpPromise || inv.solution || 'Not specified yet';
  const businessModel = venture.businessModel || 'Not specified yet';
  const pricing = venture.pricing || 'Not specified yet';
  const competitors = Array.isArray(venture.competitors) && venture.competitors.length > 0 ? venture.competitors.join(', ') : 'None listed';
  const risks = Array.isArray(venture.risks) && venture.risks.length > 0 ? venture.risks.join(', ') : 'None listed';
  const mvpSummary = mvp.mvpPromise || (Array.isArray(mvp.mustHaveFeatures) && mvp.mustHaveFeatures.length > 0 ? mvp.mustHaveFeatures.join(', ') : 'Not specified yet');

  return `
=== FOUNDER OS LONG-TERM MEMORY ===
Active Venture Name: ${name}
Target Customer: ${customer}
Core Problem: ${problem}
Solution / What is Being Built: ${solution}
Business Model: ${businessModel}
Pricing Strategy: ${pricing}
Known Competitors: ${competitors}
Key Risks: ${risks}
MVP Scope & Promise: ${mvpSummary}
=== END FOUNDER OS LONG-TERM MEMORY ===
`.trim();
}

/**
 * Automatically update the Venture document if conversation reveals new structured details.
 * Rule 8: Do not overwrite existing information unless the founder explicitly changes it.
 */
async function updateVentureMemory({ venture, userMessage, assistantReply }) {
  if (!venture) return;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) return;

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const extractionPrompt = `You are an AI structured data extractor for FounderOS.
Analyze the following user message and assistant reply to check if the founder revealed NEW startup details or explicitly UPDATED existing details.

Existing Venture Details:
- Startup Name: "${venture.ventureName || ''}"
- Customer: "${venture.ideaValidation?.ventureBrief?.targetCustomer || ''}"
- Problem: "${venture.ideaValidation?.ventureBrief?.problem || ''}"
- Solution: "${venture.ideaValidation?.ventureBrief?.building || ''}"
- Business Model: "${venture.businessModel || ''}"
- Pricing: "${venture.pricing || ''}"
- Competitors: "${(venture.competitors || []).join(', ')}"
- Risks: "${(venture.risks || []).join(', ')}"
- MVP: "${venture.mvpScope?.mvpPromise || ''}"

Recent Exchange:
User: "${userMessage}"
Assistant: "${assistantReply}"

Return valid JSON ONLY in this exact structure:
{
  "startupName": "string or null",
  "customer": "string or null",
  "problem": "string or null",
  "solution": "string or null",
  "businessModel": "string or null",
  "pricing": "string or null",
  "competitors": ["string"] or null,
  "risks": ["string"] or null,
  "mvp": "string or null",
  "isExplicitUpdate": boolean
}

Note:
- Set field to null if no new detail is mentioned.
- Set isExplicitUpdate to true ONLY if the user explicitly commanded to change or rename an existing value.`;

    const result = await model.generateContent(extractionPrompt);
    const responseText = result.response.text();
    const cleanJsonText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJsonText);

    if (!data) return;

    let updated = false;
    const isExplicit = Boolean(data.isExplicitUpdate);

    if (data.startupName && typeof data.startupName === 'string' && data.startupName.trim()) {
      if (!venture.ventureName || isExplicit) {
        venture.ventureName = data.startupName.trim();
        updated = true;
      }
    }

    if (data.customer && typeof data.customer === 'string' && data.customer.trim()) {
      if (!venture.ideaValidation?.ventureBrief?.targetCustomer || isExplicit) {
        if (!venture.ideaValidation) venture.ideaValidation = {};
        if (!venture.ideaValidation.ventureBrief) venture.ideaValidation.ventureBrief = {};
        venture.ideaValidation.ventureBrief.targetCustomer = data.customer.trim();
        updated = true;
      }
    }

    if (data.problem && typeof data.problem === 'string' && data.problem.trim()) {
      if (!venture.ideaValidation?.ventureBrief?.problem || isExplicit) {
        if (!venture.ideaValidation) venture.ideaValidation = {};
        if (!venture.ideaValidation.ventureBrief) venture.ideaValidation.ventureBrief = {};
        venture.ideaValidation.ventureBrief.problem = data.problem.trim();
        updated = true;
      }
    }

    if (data.solution && typeof data.solution === 'string' && data.solution.trim()) {
      if (!venture.ideaValidation?.ventureBrief?.building || isExplicit) {
        if (!venture.ideaValidation) venture.ideaValidation = {};
        if (!venture.ideaValidation.ventureBrief) venture.ideaValidation.ventureBrief = {};
        venture.ideaValidation.ventureBrief.building = data.solution.trim();
        updated = true;
      }
    }

    if (data.businessModel && typeof data.businessModel === 'string' && data.businessModel.trim()) {
      if (!venture.businessModel || isExplicit) {
        venture.businessModel = data.businessModel.trim();
        updated = true;
      }
    }

    if (data.pricing && typeof data.pricing === 'string' && data.pricing.trim()) {
      if (!venture.pricing || isExplicit) {
        venture.pricing = data.pricing.trim();
        updated = true;
      }
    }

    if (Array.isArray(data.competitors) && data.competitors.length > 0) {
      if (!venture.competitors || venture.competitors.length === 0 || isExplicit) {
        venture.competitors = data.competitors.map((c) => String(c).trim()).filter(Boolean);
        updated = true;
      }
    }

    if (Array.isArray(data.risks) && data.risks.length > 0) {
      if (!venture.risks || venture.risks.length === 0 || isExplicit) {
        venture.risks = data.risks.map((r) => String(r).trim()).filter(Boolean);
        updated = true;
      }
    }

    if (data.mvp && typeof data.mvp === 'string' && data.mvp.trim()) {
      if (!venture.mvpScope?.mvpPromise || isExplicit) {
        if (!venture.mvpScope) venture.mvpScope = {};
        venture.mvpScope.mvpPromise = data.mvp.trim();
        updated = true;
      }
    }

    if (updated) {
      await venture.save();
    }
  } catch (err) {
    console.warn('Venture memory update background process skipped:', err.message || err);
  }
}

module.exports = {
  saveMessage,
  getConversationHistory,
  buildFounderContextWindow,
  updateVentureMemory,
};
