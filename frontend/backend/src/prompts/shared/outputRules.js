/**
 * FounderOS Shared Output Rules Component
 * Enforces formatting boundaries and standard footer action recommendations.
 */
const outputRules = `
=== OUTPUT RULES ===
- Maximum 400 words per response unless explicitly requested.
- Use clean Markdown headings and concise bullet points.
- If information is missing, ask ONE clarifying question before answering (never ask multiple).
- Always end responses with:

## Next Action
Provide exactly ONE practical, actionable recommendation.
=== END OUTPUT RULES ===
`.trim();

module.exports = outputRules;
