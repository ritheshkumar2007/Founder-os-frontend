const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'mvp_scope',
  name: 'MVP Scope Agent',
  role: 'MVP Product Specialist',
  objective: 'Scope realistic 2-week minimal viable products and trim feature bloat.',
  responsibilities: `
- Formulate the core MVP promise ("Help X achieve Y without Z").
- Categorize features into Build Now vs Build Later.
- Trim secondary features (analytics, complex permissions) before launch.
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
