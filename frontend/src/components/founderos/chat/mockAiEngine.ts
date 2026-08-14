import type { ChatMessage, Venture } from "@/lib/founderos/types";

export const VALIDATION_QUESTIONS = [
  "What specific problem are you solving, and who has this problem?",
  "How are people solving this problem today?",
  "How often do customers face this problem, and how painful is it for them?",
  "Why would customers choose your solution over existing alternatives?",
  "What evidence do you have that customers will actually use or pay for your solution?",
];

export const FIRST_GREETING_MESSAGE =
  "Let's validate your idea before we think about building it. I'll ask you five questions, one at a time, and challenge vague answers so we can find out whether there's a real opportunity.\n\nWhat specific problem are you solving, and who has this problem?";

/**
 * Determine which question the coach currently expects an answer for,
 * based on the last assistant message in history.
 */
export function determineCurrentQuestionIndex(history: ChatMessage[]): number {
  const assistantMsgs = history.filter((m) => m.role === "assistant" || (m as any).role === "model");
  if (assistantMsgs.length === 0) return 0;

  const lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1]?.content?.toLowerCase() || "";

  // Check if score was already generated
  if (lastAssistantMsg.includes("idea validation score") || lastAssistantMsg.includes("overall score:")) {
    return 5; // Completed
  }

  if (lastAssistantMsg.includes("evidence do you have") || lastAssistantMsg.includes("actually use or pay")) {
    return 4; // Answering Q5
  }
  if (lastAssistantMsg.includes("choose your solution") || lastAssistantMsg.includes("over existing alternatives")) {
    return 3; // Answering Q4
  }
  if (lastAssistantMsg.includes("often do customers face") || lastAssistantMsg.includes("how painful is it")) {
    return 2; // Answering Q3
  }
  if (lastAssistantMsg.includes("solving this problem today") || lastAssistantMsg.includes("people solving")) {
    return 1; // Answering Q2
  }
  if (lastAssistantMsg.includes("specific problem are you solving") || lastAssistantMsg.includes("who has this problem")) {
    return 0; // Answering Q1
  }

  // Fallback based on turn count
  const userMsgCount = history.filter((m) => m.role === "user").length;
  return Math.min(4, Math.max(0, userMsgCount));
}

/**
 * FounderOS Idea Validation Coach
 * Strict 5-question sequential coach with evaluation, pushback on vague answers, gating, and scoring.
 */
export function generateMockAiResponse(userMessage: string, history: ChatMessage[], venture?: Venture): string {
  const rawText = userMessage.trim();
  const lowerMsg = rawText.toLowerCase();

  const currentQIndex = determineCurrentQuestionIndex(history);

  // GATING LOGIC: If founder tries to skip ahead before answering all 5 questions
  const isTryingToSkip =
    (lowerMsg.includes("scope") ||
      lowerMsg.includes("mvp") ||
      lowerMsg.includes("roadmap") ||
      lowerMsg.includes("feature") ||
      lowerMsg.includes("tech stack") ||
      lowerMsg.includes("build now") ||
      lowerMsg.includes("let's move on") ||
      lowerMsg.includes("skip")) &&
    currentQIndex < 5;

  if (isTryingToSkip) {
    const currentQuestion = VALIDATION_QUESTIONS[currentQIndex] || VALIDATION_QUESTIONS[0];
    return `Let's finish validating the idea first — this is the step most founders rush, and it's the one that saves you the most time later.\n\n${currentQuestion}`;
  }

  // If already completed and scored, allow MVP discussion or ongoing coaching
  if (currentQIndex >= 5) {
    if (lowerMsg.includes("scope") || lowerMsg.includes("mvp") || lowerMsg.includes("build")) {
      return `Your idea validation is complete. You're ready to head over to the Precision MVP Scope to lock down your must-have features and eliminate scope creep.`;
    }
    return `Your validation scorecard is locked in. Let's move to MVP Scoping when you're ready, or let me know if you want to stress-test any specific assumption further.`;
  }

  // QUESTION 1 EVALUATION: Problem + Target Persona
  if (currentQIndex === 0) {
    const isVagueEveryone = lowerMsg === "everyone" || lowerMsg.includes("for everyone") || lowerMsg.includes("anybody") || lowerMsg.includes("all people");
    const isTooThin = rawText.length < 15 || rawText.split(" ").length < 4;
    const isBuzzwordyOnly = (lowerMsg.includes("streamline") || lowerMsg.includes("revolutionize") || lowerMsg.includes("ai platform")) && rawText.length < 35;

    if (isVagueEveryone) {
      return `Who exactly is "everyone"? When you build for everyone, you build for no one. Give me one specific type of person — a job title, a life stage, or an exact situation — who feels this problem the most.`;
    }
    if (isTooThin || isBuzzwordyOnly) {
      return `That's too high-level. What is the specific friction they hit in their day-to-day, and who is the exact person dealing with it?`;
    }

    // Valid Q1 answer -> Move to Q2
    return `Got it. So you're focusing on ${rawText.slice(0, 100)}.\n\nSecond question: How are people solving this problem today? What tools, spreadsheets, or manual hacks are they using right now?`;
  }

  // QUESTION 2 EVALUATION: Current Alternatives & Workarounds
  if (currentQIndex === 1) {
    const saysNoAlternatives = lowerMsg.includes("no one is doing this") || lowerMsg.includes("there are no competitors") || lowerMsg.includes("no solution exists") || lowerMsg === "nothing" || lowerMsg === "none";
    const isTooThin = rawText.length < 10 || rawText.split(" ").length < 3;

    if (saysNoAlternatives) {
      return `If no one is doing anything about it today, either the problem isn't real or they're solving it with pen, paper, spreadsheets, or just living with the pain. What is their current workaround, even if it's messy or manual?`;
    }
    if (isTooThin) {
      return `Tell me more specifically what they reach for today. Are they hacking together Notion templates, firing off manual emails, or hiring an agency?`;
    }

    // Valid Q2 answer -> Move to Q3
    return `Understood — so they're currently relying on workarounds like ${rawText.slice(0, 80)}.\n\nThird question: How often do customers face this problem, and how painful is it for them (e.g. daily migraine vs. occasional annoyance)?`;
  }

  // QUESTION 3 EVALUATION: Frequency & Pain Intensity
  if (currentQIndex === 2) {
    const isTooVague = lowerMsg.includes("very painful") || lowerMsg.includes("huge problem") || lowerMsg.includes("a lot");
    const isTooThin = rawText.length < 12;

    if (isTooVague && rawText.length < 25) {
      return `Saying "it's a huge problem" doesn't give us signal. How often does it happen — multiple times a day, weekly, or once a year? And what does it cost them when it happens (wasted hours, lost revenue, stress)?`;
    }
    if (isTooThin) {
      return `Be specific about the cadence and the consequence. Is this a daily blocker that costs them real time/money, or a minor inconvenience?`;
    }

    // Valid Q3 answer -> Move to Q4
    return `Makes sense. If this hits them with that level of friction, speed and simplicity will matter a lot.\n\nFourth question: Why would customers choose your solution over existing alternatives? What is the one unfair advantage or structural reason you win?`;
  }

  // QUESTION 4 EVALUATION: Differentiation & Unfair Advantage
  if (currentQIndex === 3) {
    const isGenericAI = (lowerMsg.includes("better ui") || lowerMsg.includes("cheaper") || lowerMsg.includes("we use ai") || lowerMsg.includes("it's faster")) && rawText.length < 40;
    const isTooThin = rawText.length < 15;

    if (isGenericAI || isTooThin) {
      return `Saying "it's AI-powered" or "cheaper with a better UI" is what every startup claims. What is the fundamental wedge — is it 10x faster setup, a proprietary data integration, or eliminating a whole manual step entirely?`;
    }

    // Valid Q4 answer -> Move to Q5
    return `Clear positioning. If you can deliver on ${rawText.slice(0, 80)}, you have a real angle.\n\nFifth and final question: What evidence do you have that customers will actually use or pay for your solution? (e.g. customer interviews, waitlist signups, pre-orders, letters of intent, pilot users)`;
  }

  // QUESTION 5 EVALUATION: Evidence of Demand & Scorecard Generation
  if (currentQIndex === 4) {
    const hasZeroEvidence = lowerMsg.includes("no evidence") || lowerMsg.includes("just an idea") || lowerMsg.includes("haven't talked to anyone") || lowerMsg.includes("i think they will pay");

    let problemClarityScore = 18;
    let alternativesScore = 17;
    let painScore = 17;
    let differentiationScore = 16;
    let evidenceScore = 16;

    if (hasZeroEvidence) {
      evidenceScore = 7;
      differentiationScore = 13;
    } else if (lowerMsg.includes("pre-order") || lowerMsg.includes("paid") || lowerMsg.includes("pilot") || lowerMsg.includes("letter of intent") || lowerMsg.includes("interviews")) {
      evidenceScore = 19;
      painScore = 19;
      problemClarityScore = 19;
    }

    const totalScore = problemClarityScore + alternativesScore + painScore + differentiationScore + evidenceScore;

    let verdictText = "";
    if (totalScore >= 80) {
      verdictText = "Strong validation. Ready to move to MVP Scope.";
    } else if (totalScore >= 60) {
      verdictText = "Decent foundation, but a few weak spots. You can proceed, but revisit Evidence of Demand soon.";
    } else {
      verdictText = "Not validated yet. I'd recommend gathering more real evidence before scoping an MVP — building now risks wasting time on the wrong thing.";
    }

    return `### 🏆 Idea Validation Score: ${totalScore}/100

- **Problem Clarity (${problemClarityScore}/20):** Specific target persona with well-defined operational friction.
- **Current Alternatives Understanding (${alternativesScore}/20):** Clear view of existing status-quo workarounds and competitors.
- **Pain Frequency & Intensity (${painScore}/20):** Acute, frequent pain point with high daily/weekly friction.
- **Differentiation (${differentiationScore}/20):** Defined functional advantage over generic incumbent tools.
- **Evidence of Demand (${evidenceScore}/20):** ${hasZeroEvidence ? "Early hypothesis stage — customer discovery required to confirm pre-commitments." : "Direct customer signal and interview evidence provided."}

---

**Verdict:** ${verdictText}

${totalScore >= 60 ? "You can now proceed to the **MVP Scope** stage to lock down your core feature set and eliminate scope creep." : "If you want to proceed to MVP Scoping now, we can — but note that you're building ahead of verified customer commitment."}`;
  }

  return "Let's review your core customer problem and target audience.";
}
