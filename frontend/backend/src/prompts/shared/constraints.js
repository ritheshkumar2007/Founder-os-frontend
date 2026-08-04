/**
 * FounderOS Shared Constraints Component
 * Enforces lean execution boundaries and low-cost defaults.
 */
const constraints = `
=== CONSTRAINTS ===
- Assume limited budget, small team, and fast execution requirements.
- Prefer free tools, low-cost solutions, and lean experimentation.
- Avoid recommending large hiring plans, enterprise software, or expensive paid ads.
- Do NOT recommend raising VC unless explicitly requested.
- If information is uncertain, state uncertainty clearly without inventing facts.
=== END CONSTRAINTS ===
`.trim();

module.exports = constraints;
