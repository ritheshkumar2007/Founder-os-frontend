import type { ChatMessage, Venture } from "@/lib/founderos/types";
import { deriveIdeaScore } from "@/lib/founderos/derive";

/**
 * Intelligent Mock AI Founder Coach response engine.
 * Inspects conversation history and context to generate natural, single-focused
 * follow-up questions and rich idea scorecards directly in chat.
 */
export function generateMockAiResponse(userMessage: string, history: ChatMessage[], venture?: Venture): string {
  const userMessages = history.filter((m) => m.role === "user");
  const turnCount = userMessages.length;
  const msgLower = userMessage.toLowerCase().trim();

  // 1. Direct Score / Rating Request Intent
  if (
    msgLower.includes("score") ||
    msgLower.includes("rate") ||
    msgLower.includes("rating") ||
    msgLower.includes("points") ||
    msgLower.includes("grade") ||
    msgLower.includes("evaluate") ||
    msgLower.includes("viability")
  ) {
    const scoreData = venture ? deriveIdeaScore(venture) : null;
    const scoreVal = scoreData?.overallScore ?? 78;
    const tier = scoreData?.tier ?? "Promising";
    const pillars = scoreData?.pillars ?? {
      problemSeverity: { score: 20, max: 25, reasoning: "High workflow automation urgency." },
      willingnessToPay: { score: 16, max: 20, reasoning: "Clear budget & willingness to pay for scheduling relief." },
      distribution: { score: 15, max: 20, reasoning: "High demographic density across campus communities." },
      unfairAdvantage: { score: 11, max: 15, reasoning: "Proprietary course mapping algorithm." },
      executionSpeed: { score: 16, max: 20, reasoning: "Actionable 7 to 14-day prototype feasibility." },
    };

    return `### 🏆 100-Point Idea Viability Score (IV-Score)

**Overall Score: ${scoreVal}/100 • [Tier: ${tier}]**

---

#### 📊 5-Pillar Score Breakdown:
1. **Problem Urgency & Severity**: **${pillars.problemSeverity.score} / ${pillars.problemSeverity.max} pts**
   * *${pillars.problemSeverity.reasoning}*
2. **Willingness to Pay & Monetization**: **${pillars.willingnessToPay.score} / ${pillars.willingnessToPay.max} pts**
   * *${pillars.willingnessToPay.reasoning}*
3. **Distribution & Acquisition Velocity**: **${pillars.distribution.score} / ${pillars.distribution.max} pts**
   * *${pillars.distribution.reasoning}*
4. **Unfair Advantage & Moat**: **${pillars.unfairAdvantage.score} / ${pillars.unfairAdvantage.max} pts**
   * *${pillars.unfairAdvantage.reasoning}*
5. **Execution & 7-Day MVP Speed**: **${pillars.executionSpeed.score} / ${pillars.executionSpeed.max} pts**
   * *${pillars.executionSpeed.reasoning}*

---

#### 🚀 Key Recommendations to Reach 90+ Score:
1. **Log 3 Customer Discovery Interviews**: Conduct 3 interviews with students experiencing heavy course loads to confirm pain level.
2. **Test Pricing Directly**: Ask interviewees: *"What do you currently spend on Notion/Quizlet/planners each month?"*
3. **Lock 7-Day MVP Scope**: Strip away secondary features (social/chat) and launch only the automated schedule generator.

*💡 You can also click the **"Score: ${scoreVal}/100"** badge in the top header to view the full interactive radial scorecard modal anytime!*`;
  }

  // Turn 1: Building / Product Concept -> Ask about Target Audience
  if (turnCount === 1 || msgLower.includes("building") || msgLower.includes("idea") || msgLower.includes("platform") || msgLower.includes("app")) {
    return `That sounds like a compelling vision! To build an effective venture strategy around it, we first need to get laser-focused on who has this problem most acutely.

Which specific audience are you targeting first?

• **First-time or Solo Founders**
• **Early-stage Startup Teams (Pre-Seed/Seed)**
• **Mid-market Businesses / SMBs**
• **Individual Consumers / B2C Users**

Or do you have a different primary target customer in mind?`;
  }

  // Turn 2: Target Audience -> Ask about Core Pain Point
  if (turnCount === 2 || msgLower.includes("founder") || msgLower.includes("team") || msgLower.includes("customer") || msgLower.includes("user")) {
    return `Got it. Narrowing down your initial beachhead audience is key.

Now, what is the single biggest pain point or bottleneck your target users experience today? What makes this problem frustrating enough that they are actively looking for a solution?`;
  }

  // Turn 3: Core Pain Point -> Ask about Current Workarounds
  if (turnCount === 3 || msgLower.includes("pain") || msgLower.includes("problem") || msgLower.includes("time") || msgLower.includes("hard") || msgLower.includes("slow")) {
    return `That's a painful gap. When a problem is severe, customers usually have makeshift workarounds.

How are your target customers solving or hacking around this issue today? (For example: spreadsheets, hiring freelancers, manual labor, or combining multiple clunky tools?)`;
  }

  // Turn 4: Workarounds -> Ask about Unique Value Proposition
  if (turnCount === 4 || msgLower.includes("spreadsheet") || msgLower.includes("manual") || msgLower.includes("tool") || msgLower.includes("existing")) {
    return `Understood. Hacking together existing tools is slow and error-prone.

Why will customers choose your solution instead of sticking with their current workaround? What is your core "unfair advantage" or unique value proposition?`;
  }

  // Turn 5: Value Prop -> Ask about MVP Scope / Core Feature
  if (turnCount === 5 || msgLower.includes("instead") || msgLower.includes("faster") || msgLower.includes("ai") || msgLower.includes("better") || msgLower.includes("automate")) {
    return `Excellent distinction. 

If we were to ship a **7-Day Minimum Viable Product (MVP)** for this, what is the single MUST-HAVE feature that delivers immediate value to the user on Day 1?`;
  }

  // Turn 6+: Deep Dive / Validation Guidance
  return `That's a solid MVP scope. We now have the core pillars of your Venture Brief:
1. **Target Customer**: Clear focus
2. **Core Pain Point**: High severity
3. **Current Workaround**: Identified
4. **Unique Advantage**: Defined
5. **Day 1 MVP Focus**: Scoped

Would you like to move into **Customer Validation** to test this with real target users, or refine any of the details above?`;
}
