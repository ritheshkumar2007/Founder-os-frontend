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

  let problemScore = 14;
  let payScore = 10;
  let distributionScore = 11;
  let moatScore = 8;
  let executionScore = 12;

  let problemReasoning = "Problem defined in venture brief; further customer discovery will establish exact urgency.";
  let payReasoning = "Monetization intent established; test pricing directly with target buyers.";
  let distributionReasoning = "Identified initial beachhead audience; focus on organic 1-on-1 outreach channels.";
  let moatReasoning = "Opportunity to build high switching costs and founder speed advantages.";
  let executionReasoning = "Scope is actionable for a 7 to 14-day Minimum Viable Product.";

  const strengths: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];

  // Problem Severity
  if (problem.length > 15 && audience.length > 5) problemScore += 5;
  if (high > 0) {
    problemScore = Math.min(25, problemScore + Math.min(6, high * 2));
    problemReasoning = `${high} customer interview(s) directly confirmed high severity for this pain point.`;
    strengths.push(`Confirmed acute pain point with ${high} target user(s).`);
  } else if (total === 0) {
    risks.push("Zero customer interviews logged — problem severity remains an unverified hypothesis.");
    recommendations.push("Conduct at least 3 customer discovery interviews to validate pain severity.");
  }

  // Willingness to Pay
  if (workaround.length > 10) {
    payScore += 3;
    strengths.push(`Identified active workaround (${workaround}), indicating existing demand.`);
  }
  if (willPay > 0) {
    payScore = Math.min(20, payScore + Math.min(7, willPay * 3));
    payReasoning = `${willPay} customer(s) stated direct willingness to pay for a dedicated solution.`;
    strengths.push(`${willPay} customer(s) explicitly confirmed willingness to pay.`);
  } else if (total > 0 && willPay === 0) {
    risks.push('No interviewees have committed to paying yet; risk of building a "nice-to-have" tool.');
    recommendations.push("Ask target users in interviews what they currently budget for workarounds.");
  }

  // Distribution
  if (audience.length > 15) {
    distributionScore += 4;
    distributionReasoning = `Specific niche customer segment (${audience}) enables targeted outreach.`;
  } else {
    risks.push("Target customer profile is broad; broad audiences increase customer acquisition costs.");
    recommendations.push("Narrow your beachhead audience to a specific role, industry, or company stage.");
  }

  // Unfair Advantage & Moat
  if (building.length > 15 && outcome.length > 15) {
    moatScore += 3;
  }

  // Execution Speed
  if (building.length > 0) {
    executionScore += 3;
  }

  if (recommendations.length === 0) {
    recommendations.push("Ship a 7-day MVP to test customer activation.");
    recommendations.push("Set up direct 1-on-1 demos with early interviewees.");
    recommendations.push("Secure 3 letter-of-intent (LOI) pre-commitments.");
  }
  if (strengths.length === 0) {
    strengths.push("Clear problem-solution orientation outlined in the venture brief.");
  }
  if (risks.length === 0) {
    risks.push("Early-stage market assumptions require continued customer feedback iteration.");
  }

  let multiplier = 0.85;
  if (total > 0) {
    if (high >= 3 && willPay >= 2) multiplier = 1.15;
    else if (high >= 1 && (willPay >= 1 || maybePay >= 1)) multiplier = 1.05;
    else if (low > total / 2) multiplier = 0.75;
    else multiplier = 0.95;
  }

  const rawSum = problemScore + payScore + distributionScore + moatScore + executionScore;
  const overallScore = Math.min(100, Math.max(15, Math.round(rawSum * multiplier)));

  let tier: any = "Early Stage";
  if (overallScore >= 85) tier = "Exceptional";
  else if (overallScore >= 70) tier = "Promising";
  else if (overallScore >= 50) tier = "Early Stage";
  else tier = "High Risk";

  return {
    overallScore,
    tier,
    pillars: {
      problemSeverity: { score: problemScore, max: 25, reasoning: problemReasoning },
      willingnessToPay: { score: payScore, max: 20, reasoning: payReasoning },
      distribution: { score: distributionScore, max: 20, reasoning: distributionReasoning },
      unfairAdvantage: { score: moatScore, max: 15, reasoning: moatReasoning },
      executionSpeed: { score: executionScore, max: 20, reasoning: executionReasoning },
    },
    strengths: strengths.slice(0, 3),
    risks: risks.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    interviewMultiplier: Number(multiplier.toFixed(2)),
    lastCalculatedAt: new Date().toISOString(),
  };
}