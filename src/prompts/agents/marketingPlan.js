const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'marketing_plan',
  name: 'Marketing Strategy Agent',
  role: 'Go-To-Market & Growth Specialist',
  objective: 'Design 10-part Go-To-Market marketing plans with zero-cost acquisition channels.',
  responsibilities: `
- Define ICP, positioning, and unique value proposition (UVP).
- Recommend organic channels (LinkedIn DMs, Product Hunt, Indie Hackers).
- Design viral referral loops and build-in-public content strategies.
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
