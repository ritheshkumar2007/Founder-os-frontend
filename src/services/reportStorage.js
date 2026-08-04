const Report = require('../models/Report');

const ALL_REPORT_TYPES = [
  'venture_brief',
  'validation_report',
  'customer_persona',
  'competitor_analysis',
  'mvp_scope',
  'gtm_plan',
  'investor_summary',
];

/**
 * Save a new version snapshot of a report in MongoDB (preserving history)
 */
async function saveReportVersion({
  ventureId,
  userId,
  title,
  type,
  content,
  confidenceScore = 50,
  changeExplanation = '',
}) {
  if (!ventureId || !userId || !type || !content) return null;

  try {
    const latestExisting = await Report.findOne({ ventureId, type }).sort({ version: -1 });

    const newVersion = latestExisting ? latestExisting.version + 1 : 1;

    const reportDoc = await Report.create({
      ventureId,
      userId,
      title: title || type.replace(/_/g, ' ').toUpperCase(),
      type,
      content,
      confidenceScore: Math.min(100, Math.max(0, confidenceScore)),
      lastUpdated: new Date(),
      version: newVersion,
      changeExplanation: changeExplanation || (newVersion === 1 ? 'Initial report generated.' : 'Report updated based on new conversation insights.'),
    });

    return reportDoc;
  } catch (error) {
    console.error(`Failed to save report version for ${type}:`, error.message || error);
    return null;
  }
}

/**
 * Fetch the latest version of each of the 7 report types for a venture
 */
async function getLatestReportsForVenture(ventureId) {
  if (!ventureId) return [];

  try {
    const latestReports = await Promise.all(
      ALL_REPORT_TYPES.map(async (type) => {
        return await Report.findOne({ ventureId, type }).sort({ version: -1 });
      })
    );

    return latestReports.filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch latest reports for venture:', error.message || error);
    return [];
  }
}

/**
 * Fetch the full version history for a specific report type and venture
 */
async function getReportHistory(ventureId, type) {
  if (!ventureId || !type) return [];

  try {
    return await Report.find({ ventureId, type }).sort({ version: -1 });
  } catch (error) {
    console.error(`Failed to fetch report history for ${type}:`, error.message || error);
    return [];
  }
}

module.exports = {
  ALL_REPORT_TYPES,
  saveReportVersion,
  getLatestReportsForVenture,
  getReportHistory,
};
