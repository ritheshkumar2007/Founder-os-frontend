const { ALL_REPORT_TYPES, saveReportVersion, getLatestReportsForVenture, getReportHistory } = require('./reportStorage');
const { generateReportForType } = require('./reportGenerator');

/**
 * Reusable facade service for generating and managing AI Executive Reports
 */

/**
 * Generate/update all 7 report types for a venture after meaningful chat exchanges
 */
async function generateAllReportsForVenture({ venture, userId, history = [] }) {
  if (!venture || !userId) return [];

  const ventureId = venture._id;

  try {
    const updatedReports = [];

    for (const type of ALL_REPORT_TYPES) {
      // 1. Fetch latest existing report version to compare changes
      const previousReport = await getReportHistory(ventureId, type).then((h) => h[0] || null);

      // 2. Generate updated executive report with Gemini
      const reportData = await generateReportForType({
        type,
        venture,
        history,
        previousReport,
      });

      // 3. Save new version snapshot in MongoDB
      const savedDoc = await saveReportVersion({
        ventureId,
        userId,
        title: reportData.title,
        type: reportData.type,
        content: reportData.content,
        confidenceScore: reportData.confidenceScore,
        changeExplanation: reportData.changeExplanation,
      });

      if (savedDoc) {
        updatedReports.push(savedDoc);
      }
    }

    return updatedReports;
  } catch (error) {
    console.error('Failed to generate all venture reports:', error.message || error);
    return [];
  }
}

/**
 * Get the latest version of all 7 reports for a venture
 */
async function getAllVentureReports(ventureId) {
  return await getLatestReportsForVenture(ventureId);
}

/**
 * Get full version history for a report type
 */
async function getReportTypeHistory(ventureId, type) {
  return await getReportHistory(ventureId, type);
}

module.exports = {
  ALL_REPORT_TYPES,
  generateAllReportsForVenture,
  getAllVentureReports,
  getReportTypeHistory,
};
