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

  // If thin input with almost no information, ask for the single missing piece
  if (userMessage.trim().length < 8 && !msgLower.includes("score") && !msgLower.includes("app") && !msgLower.includes("build")) {
    return `What is the core product you're building and who is the exact target customer experiencing the problem?`;
  }

  // 100-point Idea Viability Scorecard on any idea description or score inquiry
  return `### 🏆 100-Point Idea Viability Scorecard: ${scoreVal}/100 [${tier}]

**1. Problem & Market Need:** **${pillars.problemSeverity.score} / ${pillars.problemSeverity.max} pts**
*${pillars.problemSeverity.reasoning}*

**2. Target Market Specificity:** **${pillars.distribution.score} / ${pillars.distribution.max} pts**
*${pillars.distribution.reasoning}*

**3. Competitive Differentiation:** **${pillars.unfairAdvantage.score} / ${pillars.unfairAdvantage.max} pts**
*${pillars.unfairAdvantage.reasoning}*

**4. Feasibility of 7-Day MVP:** **${pillars.executionSpeed.score} / ${pillars.executionSpeed.max} pts**
*${pillars.executionSpeed.reasoning}*

**5. Monetization Potential:** **${pillars.willingnessToPay.score} / ${pillars.willingnessToPay.max} pts**
*${pillars.willingnessToPay.reasoning}*

---

### ⚠️ Core Risk & Critical Gap
Study planner and productivity apps operate in a crowded market with high student price sensitivity — if users must type assignments manually, retention drops severely by Week 2.

---

**Next Step:** Want me to scope the 7-day MVP feature set next?`;
}
