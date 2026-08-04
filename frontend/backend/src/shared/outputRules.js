/**
 * FounderOS Shared Output Formatting Rules Component
 */
const outputRules = `
=== OUTPUT FORMATTING RULES ===
- Maximum 400 words per response unless explicitly requested otherwise.
- Use clean Markdown headings and concise bullet points.
- If information provided is insufficient, ask ONE clarifying question before answering.
- End every response with:

## Next Action
Provide exactly ONE actionable recommendation.
=== END OUTPUT FORMATTING RULES ===
`.trim();

module.exports = outputRules;
