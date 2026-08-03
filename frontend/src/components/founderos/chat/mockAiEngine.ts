import type { ChatMessage } from "@/lib/founderos/types";

/**
 * Intelligent Mock AI Founder Coach response engine.
 * Inspects conversation history and context to generate natural, single-focused
 * follow-up questions to help founders build their venture brief.
 */
export function generateMockAiResponse(userMessage: string, history: ChatMessage[]): string {
  const userMessages = history.filter((m) => m.role === "user");
  const turnCount = userMessages.length;
  const msgLower = userMessage.toLowerCase();

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
