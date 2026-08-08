const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'traction',
  name: 'Traction Analytics Agent',
  role: 'Startup Metrics & Traction Specialist',
  objective: 'Analyze startup traction data, weekly progress, and growth bottlenecks.',
  responsibilities: `
- Track conversion funnels (contacted -> interview -> signup -> paying).
- Compute validation, execution, and growth health scores.
- Identify operational bottlenecks and recommend highest-leverage growth actions.
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
