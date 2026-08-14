import type { Venture } from "./types";

export function targetCustomer(v: Venture) {
  return v?.brief?.audience?.trim() || "your target customer";
}
export function problemStatement(v: Venture) {
  return v?.brief?.problem?.trim() || "the problem you are solving";
}
export function workaround(v: Venture) {
  return v?.brief?.workaround?.trim() || "their current workaround";
}
export function valueProp(v: Venture) {
  const outcome = v?.brief?.outcome?.trim() || "the outcome they want";
  const building = v?.brief?.building?.trim() || "Your product";
  return `${building} helps ${targetCustomer(v)} achieve ${outcome}.`;
}
export function riskiestAssumption(v: Venture) {
  return `We believe ${targetCustomer(v)} experiences ${problemStatement(v)} often enough that they will change from ${workaround(v)}.`;
}
export function mvpPromise(v: Venture) {
  const outcome = v?.brief?.outcome?.trim() || "their desired outcome";
  return `Help ${targetCustomer(v)} achieve ${outcome} without ${workaround(v)}.`;
}

export type Decision = "Keep Validating" | "Promising Signal — Define Your MVP" | "Revisit the Customer Problem";

export function analyzeValidation(v: Venture) {
  const interviews = Array.isArray(v?.interviews) ? v.interviews : [];
  const total = interviews.length;
  const high = interviews.filter((i) => i.pain === "High").length;
  const low = interviews.filter((i) => i.pain === "Low").length;
  const willPay = interviews.filter((i) => i.pay === "Yes").length;
  let decision: Decision;

  if (total < 3) {
    decision = "Keep Validating";
  } else if (high >= 3) {
    decision = "Promising Signal — Define Your MVP";
  } else if (low > total / 2) {
    decision = "Revisit the Customer Problem";
  } else {
    decision = "Keep Validating";
  }

  const quotes = interviews.filter((i) => i?.quote?.trim()).slice(0, 4);
  const positives: string[] = [];
  const warnings: string[] = [];
  if (high > 0) positives.push(`${high} interview${high > 1 ? "s" : ""} reported high pain.`);
  if (willPay > 0) positives.push(`${willPay} said they would pay for a better solution.`);
  if (total === 0) warnings.push("No interviews logged yet — the analysis has no evidence to work with.");
  if (total > 0 && high === 0) warnings.push("No high-pain responses recorded so far.");
  if (total > 0 && willPay === 0) warnings.push("Nobody has said yes to paying yet.");
  if (total > 0 && total < 3) warnings.push("Sample size is below 3 interviews.");

  return { total, high, low, willPay, decision, quotes, positives, warnings };
}

export function roadmapStats(v: Venture) {
  const milestones = Array.isArray(v?.milestones) ? v.milestones : [];
  const tasks = milestones.flatMap((m) => (Array.isArray(m?.tasks) ? m.tasks : []));
  const done = tasks.filter((t) => t.done || (t as any).status === "Done").length;
  const current =
    milestones.find((m) => (Array.isArray(m?.tasks) ? m.tasks : []).some((t) => !t.done && (t as any).status !== "Done"))?.title ??
    milestones[0]?.title ??
    "";
  return {
    total: tasks.length,
    done,
    remaining: tasks.length - done,
    pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    current,
  };
}

export function sprintStats(v: Venture) {
  const sprintDays = Array.isArray(v?.sprint) ? v.sprint : [];
  const tasks = sprintDays.flatMap((d) => (Array.isArray(d?.tasks) ? d.tasks : []));
  const done = tasks.filter((t) => t.done).length;
  const currentDay = sprintDays.find((d) => (Array.isArray(d?.tasks) ? d.tasks : []).some((t) => !t.done))?.day ?? 7;
  return {
    total: tasks.length,
    done,
    remaining: tasks.length - done,
    pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    currentDay,
    complete: tasks.length > 0 && done === tasks.length,
  };
}

export function tractionMetrics(v: Venture) {
  const t = v?.traction || {
    contacted: 0,
    interviews: 0,
    waitlist: 0,
    tried: 0,
    active: 0,
    paying: 0,
    revenue: 0,
    history: [],
  };
  const contactToUser = t.contacted ? (t.active / t.contacted) * 100 : 0;
  const userToPaying = t.active ? (t.paying / t.active) * 100 : 0;
  const arpu = t.paying ? t.revenue / t.paying : 0;
  let stage = "Pre-validation";
  if (t.paying > 0) stage = "Early revenue";
  else if (t.active > 0) stage = "Early usage";
  else if (t.tried > 0 || t.waitlist > 0) stage = "Early interest";
  else if (t.interviews > 0) stage = "Validating";

  let nextAction = "Get more customer interviews";
  if (t.interviews >= 5 && t.contacted > 0 && t.tried === 0) nextAction = "Improve outreach messaging";
  else if (t.tried > 0 && t.active / Math.max(t.tried, 1) < 0.5) nextAction = "Improve product onboarding";
  else if (t.active >= 5 && t.paying === 0) nextAction = "Ask active users to pay";
  else if (t.paying > 0) nextAction = "Focus on user retention";

  return { contactToUser, userToPaying, arpu, stage, nextAction };
}

export function deriveIdeaScore(v: Venture) {
  if (v?.ideaScore && v.ideaScore.overallScore > 0) {
    return v.ideaScore;
  }

  const interviews = Array.isArray(v?.interviews) ? v.interviews : [];
  const total = interviews.length;
  const high = interviews.filter((i) => i.pain === "High").length;
  const low = interviews.filter((i) => i.pain === "Low").length;
  const willPay = interviews.filter((i) => i.pay === "Yes").length;
  const maybePay = interviews.filter((i) => i.pay === "Maybe").length;

  const brief = v?.brief || ({} as any);
  const building = brief?.building?.trim() || "";
  const audience = brief?.audience?.trim() || "";
  const problem = brief?.problem?.trim() || "";
  const workaround = brief?.workaround?.trim() || "";
  const outcome = brief?.outcome?.trim() || "";

  // Combine brief text with chat messages to understand the exact concept
  const chatText = Array.isArray(v?.chat)
    ? v.chat.filter((m) => m.role === "user").map((m) => m.content).join(" ")
    : "";
  const fullText = `${v?.name || ""} ${building} ${audience} ${problem} ${workaround} ${outcome} ${chatText}`.toLowerCase();

  // Baseline scores across the 5 structured questions (0–20 each)
  let problemClarityScore = 14;
  let alternativesScore = 13;
  let painScore = 14;
  let differentiationScore = 13;
  let evidenceScore = 11;

  let problemReasoning = "Problem and target audience defined; refine user segment specificity.";
  let alternativesReasoning = "Current workarounds identified; monitor friction in existing workflows.";
  let painReasoning = "Pain frequency is notable; verify weekly/daily operational impact.";
  let differentiationReasoning = "Value proposition established against generic status-quo tools.";
  let evidenceReasoning = "Customer signals logged; continue discovery to validate willingness to pay.";

  const strengths: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];

  // Content-Specific Adjustments
  if (fullText.includes("saas") || fullText.includes("b2b") || fullText.includes("automate") || fullText.includes("workflow") || fullText.includes("student") || fullText.includes("schedule")) {
    problemClarityScore = 17;
    alternativesScore = 16;
    painScore = 17;
    differentiationScore = 15;
    evidenceScore = 14;
    problemReasoning = "Specific workflow friction identified with direct productivity upside.";
    alternativesReasoning = "Clear status-quo hacks (spreadsheets/manual steps) ripe for replacement.";
    painReasoning = "Frequent daily or weekly operational blocker for target users.";
    strengths.push("High-leverage workflow pain with measurable time-saving value.");
    strengths.push("Target customer has existing active workarounds.");
  }

  // Factor in Real Empirical Customer Interviews
  if (high > 0) {
    painScore = Math.min(20, painScore + Math.min(4, high * 2));
    problemClarityScore = Math.min(20, problemClarityScore + Math.min(3, high));
    painReasoning = `${high} customer discovery interview(s) directly confirmed acute high pain.`;
    strengths.push(`Confirmed acute pain point with ${high} target user(s).`);
  } else if (total === 0) {
    risks.push("Zero customer discovery interviews logged — assumptions unverified.");
    recommendations.push("Conduct 3+ discovery interviews to confirm pain frequency and intensity.");
  }

  if (willPay > 0) {
    evidenceScore = Math.min(20, evidenceScore + Math.min(6, willPay * 3));
    alternativesScore = Math.min(20, alternativesScore + 2);
    evidenceReasoning = `${willPay} customer(s) explicitly confirmed willingness to pay for a dedicated solution.`;
    strengths.push(`${willPay} customer(s) explicitly committed to paying.`);
  } else if (total > 0 && willPay === 0) {
    risks.push("No interviewees have committed to paying yet; risk of nice-to-have tool.");
    recommendations.push("Ask target users what they currently budget for alternatives.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Scope precision MVP to test customer activation.");
    recommendations.push("Set up direct 1-on-1 demos with early interviewees.");
  }

  const overallScore = Math.min(
    100,
    Math.max(20, problemClarityScore + alternativesScore + painScore + differentiationScore + evidenceScore)
  );

  let tier: any = "Early Stage";
  let verdict = "";
  if (overallScore >= 80) {
    tier = "Exceptional";
    verdict = "Strong validation. Ready to move to MVP Scope.";
  } else if (overallScore >= 60) {
    tier = "Promising";
    verdict = "Decent foundation, but a few weak spots. You can proceed, but revisit evidence of demand soon.";
  } else {
    tier = "High Risk";
    verdict = "Not validated yet. I'd recommend gathering more real evidence before scoping an MVP — building now risks wasting time on the wrong thing.";
  }

  return {
    overallScore,
    tier,
    verdict,
    pillars: {
      problemSeverity: { score: problemClarityScore, max: 20, reasoning: problemReasoning },
      willingnessToPay: { score: alternativesScore, max: 20, reasoning: alternativesReasoning },
      distribution: { score: painScore, max: 20, reasoning: painReasoning },
      unfairAdvantage: { score: differentiationScore, max: 20, reasoning: differentiationReasoning },
      executionSpeed: { score: evidenceScore, max: 20, reasoning: evidenceReasoning },
    },
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    interviewMultiplier: total > 0 ? (high >= 3 ? 1.2 : 1.05) : 0.9,
    lastCalculatedAt: new Date().toISOString(),
  };
}