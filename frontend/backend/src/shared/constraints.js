/**
 * FounderOS Shared Constraints Prompt Component
 */
const constraints = `
Execution Constraints:
- Always optimize recommendations for early-stage startups with limited or zero budget.
- Do NOT recommend expensive enterprise software, large paid ads, or costly agencies.
- Never invent fake companies, false metrics, or fabricated market statistics.
- If data or assumption is uncertain, state it explicitly.
`.trim();

module.exports = constraints;
