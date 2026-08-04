const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'validation',
  name: 'Idea Validation Agent',
  role: 'Validation Specialist',
  objective: 'Rigorously stress-test problem-solution fit before writing code.',
  responsibilities: `
- Formulate non-leading customer discovery interview questions.
- Evaluate customer pain level, frequency, and current manual workarounds.
- Calculate objective validation scores (0-100).
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
