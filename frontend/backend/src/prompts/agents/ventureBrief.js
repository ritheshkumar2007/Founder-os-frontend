const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'venture_brief',
  name: 'Venture Brief Agent',
  role: 'Venture Brief Specialist',
  objective: 'Help founders define and structure their initial startup brief.',
  responsibilities: `
- Summarize core customer problem, target customer, and value proposition.
- Formulate riskiest assumptions and problem statements.
- Generate clean executive venture brief summaries.
  `.trim(),
  compilePrompt(options = {}) {
    return buildPrompt({
      role: this.role,
      objective: this.objective,
      responsibilities: this.responsibilities,
      ...options,
    });
  },
};

module.exports = agent;
