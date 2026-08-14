import type { Venture } from "./types";

export type FounderStageKey =
  | "idea_validation"
  | "mvp_scope"
  | "roadmap"
  | "marketing_plan"
  | "growth";

export interface FounderJourneyState {
  currentStage: FounderStageKey;
  completedStages: {
    ideaValidation: boolean;
    mvpScope: boolean;
    roadmap: boolean;
    marketingPlan: boolean;
    growth: boolean;
  };
}

/**
 * Stage 1: Idea Validation Completion Check
 * Requires 5 answered questions + calculated validation score
 */
export function isIdeaValidationComplete(venture: Venture | null | undefined): boolean {
  if (!venture) return false;
  const hasValidationStateComplete = Boolean(venture.validationState?.completed);
  const hasScore = Boolean(
    (venture.ideaScore && venture.ideaScore.overallScore > 0) ||
    (venture.validationState?.score && venture.validationState.score.overallScore > 0)
  );
  const hasAnswers = Boolean(
    venture.validationState?.answers?.question1 &&
    venture.validationState?.answers?.question2 &&
    venture.validationState?.answers?.question3 &&
    venture.validationState?.answers?.question4 &&
    venture.validationState?.answers?.question5
  );

  return (hasValidationStateComplete && hasScore) || (hasAnswers && hasScore) || hasScore;
}

/**
 * Stage 2: MVP Scope Completion Check
 * Requires Idea Validation complete + saved/generated must-have MVP features
 */
export function isMvpScopeComplete(venture: Venture | null | undefined): boolean {
  if (!venture || !isIdeaValidationComplete(venture)) return false;
  const vAny = venture as any;
  const hasFeatures = Boolean(
    (Array.isArray(venture.mvp?.buildNow) && venture.mvp.buildNow.length > 0) ||
    (Array.isArray(vAny.mvpScope?.mustHaveFeatures) && vAny.mvpScope.mustHaveFeatures.length > 0) ||
    (Array.isArray(vAny.mvpScope?.buildNow) && vAny.mvpScope.buildNow.length > 0) ||
    (venture.mvp?.outcome && venture.mvp.job) ||
    vAny.mvpScope?.isSaved
  );
  return hasFeatures;
}

/**
 * Stage 3: Build Roadmap Completion Check
 * Requires MVP Scope complete + saved/generated roadmap milestones
 */
export function isRoadmapComplete(venture: Venture | null | undefined): boolean {
  if (!venture || !isMvpScopeComplete(venture)) return false;
  const vAny = venture as any;
  const hasMilestones = Boolean(
    (Array.isArray(venture.milestones) &&
      venture.milestones.some((m) => m.tasks && m.tasks.length > 0)) ||
    (Array.isArray(vAny.roadmap?.milestones) &&
      vAny.roadmap.milestones.length > 0 &&
      vAny.roadmap?.isSaved) ||
    vAny.roadmap?.isSaved
  );
  return hasMilestones;
}

/**
 * Stage 4: Marketing Plan Completion Check
 * Requires Roadmap complete + saved/generated positioning or marketing plan
 */
export function isMarketingPlanComplete(venture: Venture | null | undefined): boolean {
  if (!venture || !isRoadmapComplete(venture)) return false;
  const vAny = venture as any;
  const hasMarketing = Boolean(
    venture.marketing?.positioning ||
    (venture.marketing?.idealCustomer && venture.marketing?.message) ||
    vAny.marketingPlan?.isSaved ||
    vAny.marketingPlan?.positioningStatement
  );
  return hasMarketing;
}

/**
 * Stage 5: Growth Section Unlocked Check
 */
export function isGrowthUnlocked(venture: Venture | null | undefined): boolean {
  return isMarketingPlanComplete(venture);
}

/**
 * Single source of truth for calculating current progression
 */
export function getFounderJourney(venture: Venture | null | undefined): FounderJourneyState {
  const ideaValidation = isIdeaValidationComplete(venture);
  const mvpScope = ideaValidation && isMvpScopeComplete(venture);
  const roadmap = mvpScope && isRoadmapComplete(venture);
  const marketingPlan = roadmap && isMarketingPlanComplete(venture);
  const growth = marketingPlan && isGrowthUnlocked(venture);

  let currentStage: FounderStageKey = "idea_validation";
  if (!ideaValidation) currentStage = "idea_validation";
  else if (!mvpScope) currentStage = "mvp_scope";
  else if (!roadmap) currentStage = "roadmap";
  else if (!marketingPlan) currentStage = "marketing_plan";
  else currentStage = "growth";

  return {
    currentStage,
    completedStages: {
      ideaValidation,
      mvpScope,
      roadmap,
      marketingPlan,
      growth,
    },
  };
}

/**
 * Route mapping for each stage
 */
export function getStageRoute(stage: FounderStageKey): string {
  switch (stage) {
    case "idea_validation":
      return "/workspace/idea-validation";
    case "mvp_scope":
      return "/workspace/mvp-scope";
    case "roadmap":
      return "/workspace/build-roadmap";
    case "marketing_plan":
      return "/workspace/marketing-plan";
    case "growth":
      return "/workspace/launch-sprint";
    default:
      return "/workspace/idea-validation";
  }
}

/**
 * Evaluate if a requested URL route is unlocked
 */
export function checkRouteAccess(
  pathname: string,
  venture: Venture | null | undefined
): { allowed: boolean; message: string; redirectUrl: string } {
  const journey = getFounderJourney(venture);

  // Stage 1: Idea Validation (Always Accessible)
  if (
    pathname.startsWith("/workspace/idea-validation") ||
    pathname.startsWith("/workspace/venture-brief") ||
    pathname.startsWith("/workspace/validate") ||
    pathname.startsWith("/workspace/validation-summary") ||
    pathname === "/workspace" ||
    pathname === "/workspace/"
  ) {
    return { allowed: true, message: "", redirectUrl: "" };
  }

  // Stage 2: MVP Scope
  if (pathname.startsWith("/workspace/mvp-scope")) {
    if (!journey.completedStages.ideaValidation) {
      return {
        allowed: false,
        message: "Complete Idea Validation first to unlock MVP Scope.",
        redirectUrl: "/workspace/idea-validation",
      };
    }
    return { allowed: true, message: "", redirectUrl: "" };
  }

  // Stage 3: Build Roadmap
  if (pathname.startsWith("/workspace/build-roadmap")) {
    if (!journey.completedStages.mvpScope) {
      return {
        allowed: false,
        message: "Complete MVP Scope first to unlock Roadmap.",
        redirectUrl: getStageRoute(journey.currentStage),
      };
    }
    return { allowed: true, message: "", redirectUrl: "" };
  }

  // Stage 4: Marketing Plan
  if (pathname.startsWith("/workspace/marketing-plan")) {
    if (!journey.completedStages.roadmap) {
      return {
        allowed: false,
        message: "Complete Roadmap first to unlock Marketing Plan.",
        redirectUrl: getStageRoute(journey.currentStage),
      };
    }
    return { allowed: true, message: "", redirectUrl: "" };
  }

  // Stage 5: Growth Section (Launch Sprint, Traction, Investor Update, AI Founder)
  if (
    pathname.startsWith("/workspace/launch-sprint") ||
    pathname.startsWith("/workspace/traction") ||
    pathname.startsWith("/workspace/investor-update") ||
    pathname.startsWith("/workspace/ai-founder")
  ) {
    if (!journey.completedStages.marketingPlan) {
      return {
        allowed: false,
        message: "Complete Marketing Plan first to unlock Growth.",
        redirectUrl: getStageRoute(journey.currentStage),
      };
    }
    return { allowed: true, message: "", redirectUrl: "" };
  }

  return { allowed: true, message: "", redirectUrl: "" };
}
