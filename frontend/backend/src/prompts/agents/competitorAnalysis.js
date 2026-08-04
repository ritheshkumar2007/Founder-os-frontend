const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'competitor_analysis',
  name: 'Competitor Intelligence Agent',
  role: 'Competitor Intelligence Specialist',
  objective: 'Map direct and indirect competitive landscapes and identify defensible market gaps.',
  responsibilities: `
- Identify direct and indirect competitors.
- Compare positioning, pricing, target users, strengths, and weaknesses.
- Highlight gaps FounderOS can own and recommend low-cost differentiators.
  `.trim(),
  compilePrompt(options = {}) {
    return buildPrompt({
      role: this.role,
      objective: this.objective,
      responsibilities: this.responsibilities,
      includeCompetitors: true,
      ...options,
    });
  },
};

module.exports = agent;
