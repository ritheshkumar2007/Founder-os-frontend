import type { Venture } from "./types";

export function targetCustomer(v: Venture) {
  return v.brief.audience.trim() || "your target customer";
}
export function problemStatement(v: Venture) {
  return v.brief.problem.trim() || "the problem you are solving";
}
export function workaround(v: Venture) {
  return v.brief.workaround.trim() || "their current workaround";
}
export function valueProp(v: Venture) {
  const outcome = v.brief.outcome.trim() || "the outcome they want";
  return `${v.brief.building.trim() || "Your product"} helps ${targetCustomer(v)} achieve ${outcome}.`;
}
export function riskiestAssumption(v: Venture) {
  return `We believe ${targetCustomer(v)} experiences ${problemStatement(v)} often enough that they will change from ${workaround(v)}.`;
}
export function mvpPromise(v: Venture) {
  return `Help ${targetCustomer(v)} achieve ${v.brief.outcome.trim() || "their desired outcome"} without ${workaround(v)}.`;
}

export type Decision = "Keep validating" | "Promising signal: define your MVP" | "Revisit the customer problem";

export function analyzeValidation(v: Venture) {
  const total = v.interviews.length;
  const high = v.interviews.filter((i) => i.pain === "High").length;
  const low = v.interviews.filter((i) => i.pain === "Low").length;
  const willPay = v.interviews.filter((i) => i.pay === "Yes").length;
  let decision: Decision;
  if (total < 3) decision = "Keep validating";
  else if (high >= 3) decision = "Promising signal: define your MVP";
  else if (low > total / 2) decision = "Revisit the customer problem";
  else decision = "Keep validating";

  const quotes = v.interviews.filter((i) => i.quote.trim()).slice(0, 4);
  const positives: string[] = [];
  const warnings: string[] = [];
  if (high > 0) positives.push(`${high} interview${high > 1 ? "s" : ""} reported high pain.`);
  if (willPay > 0) positives.push(`${willPay} said they would pay for a better solution.`);
  if (total === 0) warnings.push("No interviews logged yet — the analysis has no evidence to work with.");
  if (total > 0 && high === 0) warnings.push("No high-pain responses recorded so far.");
  if (total > 0 && willPay === 0) warnings.push("Nobody has said yes to paying yet.");
  if (total > 0 && total < 3) warnings.push("Sample size is below three interviews.");

  return { total, high, low, willPay, decision, quotes, positives, warnings };
}

export function roadmapStats(v: Venture) {
  const tasks = v.milestones.flatMap((m) => m.tasks);
  const done = tasks.filter((t) => t.done || t.status === "Done").length;
  const current =
    v.milestones.find((m) => m.tasks.some((t) => !t.done && t.status !== "Done"))?.title ??
    v.milestones[0]?.title ??
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
  const tasks = v.sprint.flatMap((d) => d.tasks);
  const done = tasks.filter((t) => t.done).length;
  const currentDay = v.sprint.find((d) => d.tasks.some((t) => !t.done))?.day ?? 7;
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
  const t = v.traction;
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