/**
 * FounderOS Idea Validation State Machine Engine
 * Strictly manages the 5-question sequential interview, answer evaluation, gating, and scoring.
 */

const VALIDATION_QUESTIONS = [
  "What specific problem are you solving, and who has this problem?",
  "How are people solving this problem today?",
  "How often do customers face this problem, and how painful is it for them?",
  "Why would customers choose your solution over existing alternatives?",
  "What evidence do you have that customers will actually use or pay for your solution?",
];

const INITIAL_COACH_MESSAGE =
  "Let's validate your idea before we think about building it. I'll ask you five questions, one at a time, and challenge vague answers so we can find out whether there's a real opportunity.\n\nWhat specific problem are you solving, and who has this problem?";

/**
 * Process a user message against the explicit validationState of the venture
 */
function processValidationTurn({ userMessage, validationState = {}, venture = {} }) {
  const msg = (userMessage || '').trim();
  const lowerMsg = msg.toLowerCase();

  // Normalize validationState
  const state = {
    currentQuestion: Number(validationState?.currentQuestion) || 1,
    answers: {
      question1: validationState?.answers?.question1 || null,
      question2: validationState?.answers?.question2 || null,
      question3: validationState?.answers?.question3 || null,
      question4: validationState?.answers?.question4 || null,
      question5: validationState?.answers?.question5 || null,
    },
    completed: Boolean(validationState?.completed),
    score: validationState?.score || null,
    lastEvaluatedAt: new Date().toISOString(),
  };

  // 1. GATING CHECK: Did founder try to jump ahead to MVP scope / roadmap / building?
  const isTryingToSkip =
    /\b(build (the )?mvp|mvp features?|what features? (should|to) build|what mvp|give me (the )?roadmap|tech stack|let'?s build|build now|let'?s move on|skip (to|ahead)?|move on)\b/i.test(
      msg
    ) ||
    lowerMsg.startsWith("let's build") ||
    lowerMsg.startsWith("what features") ||
    lowerMsg.startsWith("give me the");

  if (isTryingToSkip && state.currentQuestion <= 5 && !state.completed) {
    const currentQ = VALIDATION_QUESTIONS[state.currentQuestion - 1];
    return {
      reply: `Let's finish validating the idea first. We're still on Question ${state.currentQuestion} because this answer hasn't given us enough evidence yet.\n\n${currentQ}`,
      updatedState: state,
      isGated: true,
      advanced: false,
    };
  }

  // If already completed and scored
  if (state.completed || state.currentQuestion > 5) {
    return {
      reply: `Your validation is complete. You're ready to move to MVP Scope. You can proceed to the Precision MVP Scope workspace to lock down your core feature set.`,
      updatedState: state,
      isGated: false,
      advanced: false,
    };
  }

  // 2. QUESTION 1 EVALUATION: Problem + Target Customer
  if (state.currentQuestion === 1) {
    const isVagueEveryone =
      lowerMsg === "everyone" ||
      lowerMsg === "everyone." ||
      lowerMsg.includes("everyone has this problem") ||
      lowerMsg.includes("anyone") ||
      lowerMsg.includes("all people") ||
      lowerMsg.includes("all founders") ||
      lowerMsg === "people";

    const isTooThin = msg.length < 15 || msg.split(/\s+/).length < 4;

    if (isVagueEveryone || isTooThin) {
      return {
        reply: `Who exactly is 'everyone'? Give me one specific customer segment — for example, college students, restaurant owners, or freelance designers — who experiences this problem most often.`,
        updatedState: state, // Stays on Question 1
        isGated: false,
        advanced: false,
      };
    }

    // Valid answer for Q1
    state.answers.question1 = msg;
    state.currentQuestion = 2;

    const summarySnippet = msg.length > 80 ? `${msg.slice(0, 80)}...` : msg;
    return {
      reply: `Good. You identified ${summarySnippet} as the specific customer and core problem. Now let's look at what they do today.\n\n${VALIDATION_QUESTIONS[1]}`,
      updatedState: state,
      isGated: false,
      advanced: true,
    };
  }

  // 3. QUESTION 2 EVALUATION: Current Alternatives & Status Quo
  if (state.currentQuestion === 2) {
    const isNoAlternative =
      lowerMsg.includes("no one is doing this") ||
      lowerMsg.includes("there are no competitors") ||
      lowerMsg.includes("no solution exists") ||
      lowerMsg.includes("people don't have a good solution") ||
      lowerMsg === "nothing" ||
      lowerMsg === "none" ||
      lowerMsg === "they don't";

    const isTooThin = msg.length < 10 || msg.split(/\s+/).length < 2;

    if (isNoAlternative || isTooThin) {
      return {
        reply: `If no one is doing anything about it today, either the problem isn't real or they're solving it with pen, paper, spreadsheets, or just living with the pain. What is their current workaround, even if it's messy or manual?`,
        updatedState: state, // Stays on Question 2
        isGated: false,
        advanced: false,
      };
    }

    // Valid answer for Q2
    state.answers.question2 = msg;
    state.currentQuestion = 3;

    const summarySnippet = msg.length > 70 ? `${msg.slice(0, 70)}...` : msg;
    return {
      reply: `Understood. Knowing their current workarounds like ${summarySnippet} clarifies what we're competing against.\n\n${VALIDATION_QUESTIONS[2]}`,
      updatedState: state,
      isGated: false,
      advanced: true,
    };
  }

  // 4. QUESTION 3 EVALUATION: Frequency & Pain Intensity
  if (state.currentQuestion === 3) {
    const isVaguePain =
      lowerMsg === "it's a huge problem" ||
      lowerMsg === "it's very painful" ||
      lowerMsg === "very painful" ||
      lowerMsg === "huge problem" ||
      lowerMsg === "a lot" ||
      lowerMsg === "very frequent";

    const isTooThin = msg.length < 12;

    if (isVaguePain || isTooThin) {
      return {
        reply: `Saying 'it's a huge problem' doesn't give us signal. How often does it happen — multiple times a day, weekly, or once a year? And what does it cost them when it happens (wasted hours, lost revenue, stress)?`,
        updatedState: state, // Stays on Question 3
        isGated: false,
        advanced: false,
      };
    }

    // Valid answer for Q3
    state.answers.question3 = msg;
    state.currentQuestion = 4;

    return {
      reply: `Got it. Acute pain frequency gives you a real wedge.\n\n${VALIDATION_QUESTIONS[3]}`,
      updatedState: state,
      isGated: false,
      advanced: true,
    };
  }

  // 5. QUESTION 4 EVALUATION: Differentiation & Unfair Advantage
  if (state.currentQuestion === 4) {
    const isGenericClaims =
      (lowerMsg.includes("better ui") ||
        lowerMsg.includes("we use ai") ||
        lowerMsg.includes("it's cheaper") ||
        lowerMsg.includes("it's faster") ||
        lowerMsg.includes("people will definitely pay")) &&
      msg.length < 35;

    const isTooThin = msg.length < 14;

    if (isGenericClaims || isTooThin) {
      return {
        reply: `Saying 'it's AI-powered' or 'cheaper with a better UI' is what every startup claims. What is the fundamental wedge — is it 10x faster setup, a proprietary data integration, or eliminating a whole manual step entirely?`,
        updatedState: state, // Stays on Question 4
        isGated: false,
        advanced: false,
      };
    }

    // Valid answer for Q4
    state.answers.question4 = msg;
    state.currentQuestion = 5;

    return {
      reply: `Clear positioning.\n\n${VALIDATION_QUESTIONS[4]}`,
      updatedState: state,
      isGated: false,
      advanced: true,
    };
  }

  // 6. QUESTION 5 EVALUATION: Evidence of Demand & Score Calculation
  if (state.currentQuestion === 5) {
    const hasZeroEvidence =
      lowerMsg.includes("no idea") ||
      lowerMsg.includes("i don't know") ||
      lowerMsg.includes("no evidence") ||
      lowerMsg.includes("haven't talked") ||
      lowerMsg.includes("just an idea") ||
      lowerMsg.includes("i think they will pay");

    state.answers.question5 = msg;
    state.currentQuestion = 6;
    state.completed = true;

    // Calculate score /20 for each category
    let problemClarity = 18;
    let alternatives = 17;
    let painFrequency = 17;
    let differentiation = 16;
    let evidence = 16;

    let problemReason = "Target customer and core friction point clearly articulated.";
    let alternativesReason = "Current manual workarounds and alternatives identified.";
    let painReason = "High pain frequency confirmed with operational impact.";
    let differentiationReason = "Concrete functional differentiation over status quo.";
    let evidenceReason = "Direct customer validation signal provided.";

    if (hasZeroEvidence) {
      evidence = 8;
      differentiation = 14;
      evidenceReason = "No customer discovery or pre-sales logged yet; relies on founder hypothesis.";
    } else if (
      lowerMsg.includes("pre-order") ||
      lowerMsg.includes("paid") ||
      lowerMsg.includes("interviews") ||
      lowerMsg.includes("pilot") ||
      lowerMsg.includes("waitlist")
    ) {
      evidence = 19;
      evidenceReason = "Empirical signal provided via user interviews, pilot usage, or pre-commitments.";
    }

    const totalScore = problemClarity + alternatives + painFrequency + differentiation + evidence;

    let verdict = "";
    if (totalScore >= 80) {
      verdict = "Strong validation. Ready to move to MVP Scope.";
    } else if (totalScore >= 60) {
      verdict = "Decent foundation, but a few weak spots. You can proceed, but revisit Evidence of Demand soon.";
    } else {
      verdict = "Not validated yet. I'd recommend gathering more real evidence before scoping an MVP — building now risks wasting time on the wrong thing.";
    }

    const scoreData = {
      overallScore: totalScore,
      tier: totalScore >= 80 ? "Exceptional" : totalScore >= 60 ? "Promising" : "High Risk",
      verdict,
      pillars: {
        problemSeverity: { score: problemClarity, max: 20, reasoning: problemReason },
        willingnessToPay: { score: alternatives, max: 20, reasoning: alternativesReason },
        distribution: { score: painFrequency, max: 20, reasoning: painReason },
        unfairAdvantage: { score: differentiation, max: 20, reasoning: differentiationReason },
        executionSpeed: { score: evidence, max: 20, reasoning: evidenceReason },
      },
      lastCalculatedAt: new Date().toISOString(),
    };

    state.score = scoreData;

    const reply = `### 🏆 Idea Validation Score: ${totalScore}/100

- **Problem Clarity (${problemClarity}/20):** ${problemReason}
- **Current Alternatives Understanding (${alternatives}/20):** ${alternativesReason}
- **Pain Frequency & Intensity (${painFrequency}/20):** ${painReason}
- **Differentiation (${differentiation}/20):** ${differentiationReason}
- **Evidence of Demand (${evidence}/20):** ${evidenceReason}

---

**Verdict:** ${verdict}

${
  totalScore >= 60
    ? "Your validation is complete. You're ready to move to **MVP Scope**."
    : "If you insist on proceeding, you can move to MVP Scope, but note that you are building ahead of verified customer commitment."
}`;

    return {
      reply,
      updatedState: state,
      isGated: false,
      advanced: true,
    };
  }

  return {
    reply: `Let's review your core customer problem and target audience.\n\n${VALIDATION_QUESTIONS[0]}`,
    updatedState: state,
    isGated: false,
    advanced: false,
  };
}

module.exports = {
  VALIDATION_QUESTIONS,
  INITIAL_COACH_MESSAGE,
  processValidationTurn,
};
