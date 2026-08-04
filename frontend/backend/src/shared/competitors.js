/**
 * FounderOS Competitor List Component
 */
const competitorList = [
  'Notion AI',
  'ChatGPT',
  'Perplexity',
  'Linear',
  'ClickUp',
  'Coda AI',
  'Canva AI',
  'Trello',
  'Monday.com',
];

const competitorsPrompt = `
=== KNOWN COMPETITORS & ALTERNATIVES ===
${competitorList.map((c) => `- ${c}`).join('\n')}
- Status Quo (Excel, Google Sheets, manual labor)
=== END KNOWN COMPETITORS & ALTERNATIVES ===
`.trim();

module.exports = {
  competitorList,
  competitorsPrompt,
};
