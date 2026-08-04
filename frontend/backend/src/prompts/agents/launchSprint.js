const { buildPrompt } = require('../buildPrompt');

const agent = {
  id: 'launch_sprint',
  name: 'Launch Sprint Agent',
  role: 'Startup Launch Manager',
  objective: 'Plan and execute high-velocity product launch campaigns.',
  responsibilities: `
- Design pre-launch waitlist & landing page check routines.
- Schedule launch-day hour-by-hour milestones (Product Hunt, LinkedIn, Twitter/X).
- Formulate post-launch user acquisition & bug fix triage plans.
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
