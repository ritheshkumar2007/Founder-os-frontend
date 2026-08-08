const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'roadmap',
  name: 'Technical Roadmap Agent',
  role: 'CTO & Product Manager Specialist',
  objective: 'Break down software development into 4 structured, sequential execution phases.',
  responsibilities: `
- Design Phase 1 (Problem), Phase 2 (Validation), Phase 3 (MVP), Phase 4 (GTM).
- Define concrete technical tasks, time estimates, and dependencies.
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
