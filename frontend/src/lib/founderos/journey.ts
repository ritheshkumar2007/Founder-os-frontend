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

export interface RouteAccessResult {
  allowed: boolean;
  title: string;
  description: string;
  message: string;
  redirectUrl: string;
}

/**
 * Evaluate if a requested URL route is unlocked
 */
export function checkRouteAccess(
  pathname: string,
  venture: Venture | null | undefined
): RouteAccessResult {
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
    return { allowed: true, title: "", description: "", message: "", redirectUrl: "" };
  }

  // Stage 2: MVP Scope
  if (pathname.startsWith("/workspace/mvp-scope")) {
    if (!journey.completedStages.ideaValidation) {
      return {
        allowed: false,
        title: "Complete Idea Validation first.",
        description: "You can't access MVP Scope until you finish the 5 validation questions.",
        message: "Complete Idea Validation first. You can't access MVP Scope until you finish the 5 validation questions.",
        redirectUrl: "/workspace/idea-validation",
      };
    }
    return { allowed: true, title: "", description: "", message: "", redirectUrl: "" };
  }

  // Stage 3: Build Roadmap
  if (pathname.startsWith("/workspace/build-roadmap")) {
    if (!journey.completedStages.ideaValidation) {
      return {
        allowed: false,
        title: "Complete Idea Validation first.",
        description: "You can't access Roadmap until you finish the 5 validation questions.",
        message: "Complete Idea Validation first. You can't access Roadmap until you finish the 5 validation questions.",
        redirectUrl: "/workspace/idea-validation",
      };
    }
    if (!journey.completedStages.mvpScope) {
      return {
        allowed: false,
        title: "Complete MVP Scope first.",
        description: "You can't access Roadmap until your MVP Scope is generated.",
        message: "Complete MVP Scope first. You can't access Roadmap until your MVP Scope is generated.",
        redirectUrl: "/workspace/mvp-scope",
      };
    }
    return { allowed: true, title: "", description: "", message: "", redirectUrl: "" };
  }

  // Stage 4: Marketing Plan
  if (pathname.startsWith("/workspace/marketing-plan")) {
    if (!journey.completedStages.ideaValidation) {
      return {
        allowed: false,
        title: "Complete Idea Validation first.",
        description: "You can't access Marketing Plan until you finish the 5 validation questions.",
        message: "Complete Idea Validation first. You can't access Marketing Plan until you finish the 5 validation questions.",
        redirectUrl: "/workspace/idea-validation",
      };
    }
    if (!journey.completedStages.mvpScope) {
      return {
        allowed: false,
        title: "Complete MVP Scope first.",
        description: "You can't access Marketing Plan until your MVP Scope is generated.",
        message: "Complete MVP Scope first. You can't access Marketing Plan until your MVP Scope is generated.",
        redirectUrl: "/workspace/mvp-scope",
      };
    }
    if (!journey.completedStages.roadmap) {
      return {
        allowed: false,
        title: "Complete Roadmap first.",
        description: "You can't access Marketing Plan until your roadmap is completed.",
        message: "Complete Roadmap first. You can't access Marketing Plan until your roadmap is completed.",
        redirectUrl: "/workspace/build-roadmap",
      };
    }
    return { allowed: true, title: "", description: "", message: "", redirectUrl: "" };
  }

  // Stage 5: Growth Section (Launch Sprint, Traction, Investor Update, AI Founder)
  if (
    pathname.startsWith("/workspace/launch-sprint") ||
    pathname.startsWith("/workspace/traction") ||
    pathname.startsWith("/workspace/investor-update") ||
    pathname.startsWith("/workspace/ai-founder")
  ) {
    if (!journey.completedStages.ideaValidation) {
      return {
        allowed: false,
        title: "Complete Idea Validation first.",
        description: "You can't access Growth until you finish the 5 validation questions.",
        message: "Complete Idea Validation first. You can't access Growth until you finish the 5 validation questions.",
        redirectUrl: "/workspace/idea-validation",
      };
    }
    if (!journey.completedStages.mvpScope) {
      return {
        allowed: false,
        title: "Complete MVP Scope first.",
        description: "You can't access Growth until your MVP Scope is generated.",
        message: "Complete MVP Scope first. You can't access Growth until your MVP Scope is generated.",
        redirectUrl: "/workspace/mvp-scope",
      };
    }
    if (!journey.completedStages.roadmap) {
      return {
        allowed: false,
        title: "Complete Roadmap first.",
        description: "You can't access Growth until your roadmap is completed.",
        message: "Complete Roadmap first. You can't access Growth until your roadmap is completed.",
        redirectUrl: "/workspace/build-roadmap",
      };
    }
    if (!journey.completedStages.marketingPlan) {
      return {
        allowed: false,
        title: "Complete Marketing Plan first.",
        description: "Finish your marketing plan to unlock Growth.",
        message: "Complete Marketing Plan first. Finish your marketing plan to unlock Growth.",
        redirectUrl: "/workspace/marketing-plan",
      };
    }
    return { allowed: true, title: "", description: "", message: "", redirectUrl: "" };
  }

  return { allowed: true, title: "", description: "", message: "", redirectUrl: "" };
}
