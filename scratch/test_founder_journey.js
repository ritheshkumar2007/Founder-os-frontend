const {
  isIdeaValidationComplete,
  isMvpScopeComplete,
  isRoadmapComplete,
  isMarketingPlanComplete,
  isGrowthUnlocked,
  getFounderJourney,
  getStageRoute,
  checkRouteAccess,
} = require("../frontend/src/lib/founderos/journey.ts");

// Let's create mock ventures for all 10 test cases:
console.log("=================================================");
console.log("RUNNING SEQUENTIAL FOUNDER JOURNEY ACCEPTANCE TESTS");
console.log("=================================================");

function createEmptyVenture() {
  return {
    id: "v-1",
    name: "Acme AI",
    brief: { building: "", audience: "", problem: "", workaround: "", outcome: "", saved: false },
    validationState: {
      currentQuestion: 1,
      answers: { question1: null, question2: null, question3: null, question4: null, question5: null },
      completed: false,
      score: null,
    },
    ideaScore: null,
    mvp: { buildNow: [], later: [], outcome: "", job: "", coreProblem: "", promise: "", target: "" },
    milestones: [],
    marketing: { idealCustomer: "", positioning: "", message: "", headline: "", cta: "", channels: [] },
  };
}

let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${description}`);
  }
}

// Test 1: New venture starts at Idea Validation
const v1 = createEmptyVenture();
const j1 = getFounderJourney(v1);
assert("Test 1: New venture current stage is 'idea_validation'", j1.currentStage === "idea_validation");
assert("Test 1b: Target route is '/workspace/idea-validation'", getStageRoute(j1.currentStage) === "/workspace/idea-validation");

// Test 2: Try accessing MVP Scope before completing Idea Validation -> Blocked
const r2 = checkRouteAccess("/workspace/mvp-scope", v1);
assert("Test 2: Direct URL access to MVP Scope is blocked", !r2.allowed);
assert("Test 2b: Redirects to Idea Validation", r2.redirectUrl === "/workspace/idea-validation");
assert("Test 2c: Title is 'Complete Idea Validation first.'", r2.title === "Complete Idea Validation first.");
assert("Test 2d: Description explains 5 questions", r2.description.includes("5 validation questions"));

// Test 3: Complete 5 validation questions + score -> Unlocks MVP Scope
const v3 = createEmptyVenture();
v3.validationState = {
  currentQuestion: 6,
  answers: {
    question1: "Lead AI DevOps teams",
    question2: "Manual bash scripts",
    question3: "Daily pain, severe",
    question4: "Autonomous healing pipelines",
    question5: "25 signed pilot letters",
  },
  completed: true,
  score: { overallScore: 88 },
};
v3.ideaScore = { overallScore: 88 };
const j3 = getFounderJourney(v3);
assert("Test 3: Idea Validation complete moves current stage to 'mvp_scope'", j3.currentStage === "mvp_scope");
assert("Test 3b: MVP Scope route access is allowed", checkRouteAccess("/workspace/mvp-scope", v3).allowed);

// Test 4: Try opening Roadmap before completing MVP Scope -> Blocked
const r4 = checkRouteAccess("/workspace/build-roadmap", v3);
assert("Test 4: Roadmap access is blocked before MVP Scope is completed", !r4.allowed);
assert("Test 4b: Redirects to MVP Scope", r4.redirectUrl === "/workspace/mvp-scope");
assert("Test 4c: Title is 'Complete MVP Scope first.'", r4.title === "Complete MVP Scope first.");

// Test 5: Complete MVP Scope -> Unlocks Roadmap
const v5 = JSON.parse(JSON.stringify(v3));
v5.mvp = {
  buildNow: ["Core Pipeline Engine", "Agentic Orchestrator"],
  later: ["Custom Enterprise SSO"],
  outcome: "Zero latency deployment",
  job: "Lead AI DevOps",
  coreProblem: "Manual bash scripts",
  promise: "Automated agentic workflow",
  target: "Two weeks",
};
v5.mvpScope = { isSaved: true, mustHaveFeatures: ["Core Pipeline Engine"] };
const j5 = getFounderJourney(v5);
assert("Test 5: MVP Scope completion moves current stage to 'roadmap'", j5.currentStage === "roadmap");
assert("Test 5b: Roadmap route access is allowed", checkRouteAccess("/workspace/build-roadmap", v5).allowed);

// Test 6: Try opening Marketing Plan before completing Roadmap -> Blocked
const r6 = checkRouteAccess("/workspace/marketing-plan", v5);
assert("Test 6: Marketing Plan access is blocked before Roadmap is complete", !r6.allowed);
assert("Test 6b: Title is 'Complete Roadmap first.'", r6.title === "Complete Roadmap first.");

// Test 7: Complete Roadmap -> Unlocks Marketing Plan
const v7 = JSON.parse(JSON.stringify(v5));
v7.milestones = [
  { id: "m-1", title: "Phase 1: Architecture", tasks: [{ id: "t1", title: "Setup", done: true }] },
  { id: "m-2", title: "Phase 2: Core Engine", tasks: [{ id: "t2", title: "Build", done: false }] },
];
v7.roadmap = { isSaved: true, milestones: v7.milestones };
const j7 = getFounderJourney(v7);
assert("Test 7: Roadmap completion moves current stage to 'marketing_plan'", j7.currentStage === "marketing_plan");
assert("Test 7b: Marketing Plan route access is allowed", checkRouteAccess("/workspace/marketing-plan", v7).allowed);

// Test 8: Complete Marketing Plan -> Unlocks Growth
const v8 = JSON.parse(JSON.stringify(v7));
v8.marketing = {
  idealCustomer: "AI DevOps Engineers",
  positioning: "The AI Operating System for Autonomous Cloud Infra",
  message: "Eliminate 40 hours of manual config",
  headline: "Deploy AI Workflows In Seconds",
  cta: "Start Free",
  channels: ["Twitter/X", "ProductHunt", "GitHub"],
};
v8.marketingPlan = { isSaved: true, positioningStatement: v8.marketing.positioning };
const j8 = getFounderJourney(v8);
assert("Test 8: Marketing Plan completion moves current stage to 'growth'", j8.currentStage === "growth");
assert("Test 8b: Launch Sprint route access is allowed", checkRouteAccess("/workspace/launch-sprint", v8).allowed);
assert("Test 8c: Traction route access is allowed", checkRouteAccess("/workspace/traction", v8).allowed);
assert("Test 8d: Investor Update route access is allowed", checkRouteAccess("/workspace/investor-update", v8).allowed);

console.log("=================================================");
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log("=================================================");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
