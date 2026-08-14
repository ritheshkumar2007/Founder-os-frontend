import type { ChatMessage, Venture } from "@/lib/founderos/types";
import { deriveIdeaScore } from "@/lib/founderos/derive";

/**
 * FounderOS AI Coach for Idea Validation
 * Produces immediate, structured idea viability assessments without preamble or holding statements.
 */
export function generateMockAiResponse(userMessage: string, history: ChatMessage[], venture?: Venture): string {
  const msgLower = userMessage.toLowerCase().trim();

  // Evaluate idea score dynamically
  const scoreData = venture ? deriveIdeaScore(venture) : null;
  const scoreVal = scoreData?.overallScore ?? 75;
  const tier = scoreData?.tier ?? "Promising";
  const pillars = scoreData?.pillars ?? {
    problemSeverity: { score: 19, max: 25, reasoning: "Acute deadline and multi-course scheduling friction." },
    willingnessToPay: { score: 14, max: 20, reasoning: "Direct utility, but high student price sensitivity." },
    distribution: { score: 15, max: 20, reasoning: "Dense campus networks enable organic peer distribution." },
    unfairAdvantage: { score: 10, max: 15, reasoning: "Differentiation requires zero-manual-entry parsing." },
    executionSpeed: { score: 17, max: 20, reasoning: "Core schedule aggregator can be built in 7 to 14 days." },
  };

  // If thin input with almost no information, ask for the single missing piece directly
  if (userMessage.trim().length < 8 && !msgLower.includes("score") && !msgLower.includes("app") && !msgLower.includes("build")) {
    return `Give me the core product in one sentence and the exact target persona who pays for it.`;
  }

  if (msgLower.includes("scope") || msgLower.includes("mvp") || msgLower.includes("feature")) {
    return `Cut anything that doesn't solve the immediate customer friction point. Lock in authentication, core workflow resolution, and a single export or output action. Want me to scope your precision MVP next?`;
  }

  if (msgLower.includes("interview") || msgLower.includes("radar") || msgLower.includes("customer")) {
    return `Sounds like you're at the Problem Radar stage. Ask 5 users how they solve this today and what workarounds they're paying for — if nobody is hacking together a solution right now, the pain isn't urgent enough. Once you have that signal, we'll lock down your MVP scope.`;
  }

  if (msgLower.includes("sprint") || msgLower.includes("launch") || msgLower.includes("7-day")) {
    return `Keep the 7-Day Build Sprint strictly bounded: Day 1-2 schemas and endpoints, Day 3-5 core UI flow, Day 6 smoke testing, Day 7 direct distribution to 10 pilot users. Defer all secondary dashboard widgets to post-launch.`;
  }

  if (msgLower.includes("investor") || msgLower.includes("raise") || msgLower.includes("traction")) {
    return `Investors care about verified traction velocity: weekly active usage and customer willingness to pay. Lock down 10 reference users on your live build before generating the pitch brief and opening your data room.`;
  }

  // 100-point Idea Viability Scorecard on idea description or score inquiry
  return `### 100-Point Idea Viability Scorecard: ${scoreVal}/100 [${tier}]

- **Problem & Market Need:** ${pillars.problemSeverity.score}/${pillars.problemSeverity.max} pts — ${pillars.problemSeverity.reasoning}
- **Target Specificity & Distribution:** ${pillars.distribution.score}/${pillars.distribution.max} pts — ${pillars.distribution.reasoning}
- **Competitive Advantage:** ${pillars.unfairAdvantage.score}/${pillars.unfairAdvantage.max} pts — ${pillars.unfairAdvantage.reasoning}
- **7-Day MVP Feasibility:** ${pillars.executionSpeed.score}/${pillars.executionSpeed.max} pts — ${pillars.executionSpeed.reasoning}
- **Willingness to Pay:** ${pillars.willingnessToPay.score}/${pillars.willingnessToPay.max} pts — ${pillars.willingnessToPay.reasoning}

**Primary Risk:** High friction in manual data entry will kill retention by Week 2.
**Next Action:** Sounds like you're ready for the Precision MVP Scope — want me to scope your zero-bloat feature set?`;
}
