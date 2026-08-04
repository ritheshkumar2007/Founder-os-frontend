/**
 * FounderOS Competitor Data Component
 * Reusable competitor inventory for intelligence and positioning agents.
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
- Status Quo (Excel, Google Sheets, manual workarounds)
=== END KNOWN COMPETITORS & ALTERNATIVES ===
`.trim();

module.exports = {
  competitorList,
  competitorsPrompt,
};
