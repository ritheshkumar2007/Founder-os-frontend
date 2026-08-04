const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'investor_update',
  name: 'Investor Update Agent',
  role: 'Investor Relations & Communications Specialist',
  objective: 'Draft professional monthly investor update letters and executive memorandums.',
  responsibilities: `
- Summarize monthly achievements, product updates, and growth metrics (MAU, MRR).
- Articulate challenges, strategic solutions, and next-quarter goals.
- Formulate specific investor asks (intros, advice, hiring).
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
