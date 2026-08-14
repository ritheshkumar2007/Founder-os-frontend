import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Button,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  TextArea,
  TextInput,
} from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Layers, ShieldAlert, Cpu, Clock, CheckCircle2, History, ArrowRight, AlertCircle } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { toast } from "sonner";
import api from "@/lib/api";

const TITLE = "MVP Scope — FounderOS";
const DESCRIPTION = "AI-generated MVP blueprint, feature categorization, timeline visualization, and technical scope.";

export const Route = createFileRoute("/workspace/mvp-scope")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MvpScopePage,
});

export interface GeneratedScope {
  mvpName: string;
  coreAssumption: string;
  mustHaveFeatures: string[];
  cutList: { feature: string; reasonDeferred: string }[];
  featuresToAvoid: string[];
  niceToHaveFeatures: string[];
  coreFeatures: string[];
  coreUserFlow: string[];
  userJourney: string[];
  buildEstimate: string;
  engineeringRisks: { component: string; riskLevel: string; details: string }[];
  technicalRequirements: string[];
  developmentTimeline: { phase: string; duration: string; tasks: string[] }[];
  successMetric: string;
  successMetrics: string[];
  provisionalWarning?: string;
}

function formatScopeBlueprint(raw: any, fallbackName: string, ideaText: string, audienceText: string, problemText: string): GeneratedScope {
  const scope = raw?.generatedScope || raw?.mvpScope || raw || {};
  const problem = problemText || scope.problemSolved || scope.coreCustomerProblem || "primary customer pain";
  const audience = audienceText || scope.targetUsers || "target customers";

  const coreAssumption =
    scope.coreAssumption ||
    `Target users (${audience}) will switch from existing alternatives if the MVP eliminates ${problem} in one streamlined workflow.`;

  const mustHaveFeatures = (Array.isArray(scope.mustHaveFeatures) && scope.mustHaveFeatures.length > 0)
    ? scope.mustHaveFeatures
    : [
        `Core Problem Intake Engine, because ${audience} needs zero-friction entry without setup complexity`,
        `Automated Resolution Core, because it directly delivers the value proposition resolving ${problem}`,
        `Actionable Result Dashboard, because users need immediate, verifiable proof of outcome`,
      ];

  const cutList: { feature: string; reasonDeferred: string }[] = (Array.isArray(scope.cutList) && scope.cutList.length > 0)
    ? scope.cutList
    : [
        { feature: "Enterprise SSO & Custom Roles", reasonDeferred: "Unnecessary for v1; delays first user signal" },
        { feature: "Automated Billing & Tier Logic", reasonDeferred: "Test pricing manually via Stripe links before automating billing code" },
        { feature: "Third-Party Integrations", reasonDeferred: "Core value must be proven standalone before building connectors" },
      ];

  const featuresToAvoid = (Array.isArray(scope.featuresToAvoid) && scope.featuresToAvoid.length > 0)
    ? scope.featuresToAvoid
    : cutList.map((c) => `${c.feature} (${c.reasonDeferred})`);

  const niceToHaveFeatures = (Array.isArray(scope.niceToHaveFeatures) && scope.niceToHaveFeatures.length > 0)
    ? scope.niceToHaveFeatures
    : ["Exportable PDF Summary Reports — deferred to v1.1", "Custom Webhooks — deferred to post-validation"];

  const coreFeatures = (Array.isArray(scope.coreFeatures) && scope.coreFeatures.length > 0)
    ? scope.coreFeatures
    : [
        `Direct resolution engine for ${problem}`,
        `Zero-friction intake for ${audience}`,
        `Outcome delivery and proof dashboard`,
      ];

  const coreUserFlow = (Array.isArray(scope.coreUserFlow) && scope.coreUserFlow.length > 0)
    ? scope.coreUserFlow
    : (Array.isArray(scope.userJourney) && scope.userJourney.length > 0
      ? scope.userJourney
      : [
          `1. ${audience} accesses the app and inputs their current problem scenario.`,
          `2. The core resolution engine processes the request and executes the workflow.`,
          `3. The user receives actionable results and resolves ${problem} within 2 minutes.`,
        ]);

  const userJourney = coreUserFlow;

  const buildEstimate = scope.buildEstimate || "2 Weeks";

  const engineeringRisks = (Array.isArray(scope.engineeringRisks) && scope.engineeringRisks.length > 0)
    ? scope.engineeringRisks
    : [
        { component: "Core Resolution Engine", riskLevel: "Medium", details: "Requires deterministic output and low response latency" },
        { component: "User Intake & Data Persistence", riskLevel: "Low", details: "Standard CRUD operations and schema management" },
      ];

  const technicalRequirements = (Array.isArray(scope.technicalRequirements) && scope.technicalRequirements.length > 0)
    ? scope.technicalRequirements
    : [
        "React + Vite + TypeScript Frontend",
        "Node.js + Express Backend API",
        "MongoDB Atlas Persistence Storage",
        "Gemini 1.5 Flash AI Engine API",
      ];

  const developmentTimeline = (Array.isArray(scope.developmentTimeline) && scope.developmentTimeline.length > 0)
    ? scope.developmentTimeline
    : [
        {
          phase: "Phase 1: Foundation & Core Loop",
          duration: "Days 1–4",
          tasks: ["Database Schemas", "Auth Middleware", "Problem Intake UI"],
        },
        {
          phase: "Phase 2: Resolution Engine Integration",
          duration: "Days 5–9",
          tasks: [`Build direct resolution engine for ${problem}`, "Wire State Store", "Build Result View"],
        },
        {
          phase: "Phase 3: Testing & Production Deployment",
          duration: "Days 10–14",
          tasks: ["Conduct 5 Customer Test Loops", "Deploy Backend on Render", "Deploy Frontend on Vercel"],
        },
      ];

  const successMetric =
    scope.successMetric ||
    `70% of active test users complete the core loop end-to-end and report immediate relief from ${problem}`;

  const successMetrics = (Array.isArray(scope.successMetrics) && scope.successMetrics.length > 0)
    ? scope.successMetrics
    : [
        "10 Verified Customer Testing Sessions",
        "70% Core Task Completion Rate",
        "<2s Response Latency on Outputs",
      ];

  return {
    mvpName: scope.mvpName || `${fallbackName || "FounderOS"} Core MVP`,
    coreAssumption,
    mustHaveFeatures,
    cutList,
    featuresToAvoid,
    niceToHaveFeatures,
    coreFeatures,
    coreUserFlow,
    userJourney,
    buildEstimate,
    engineeringRisks,
    technicalRequirements,
    developmentTimeline,
    successMetric,
    successMetrics,
    provisionalWarning: scope.provisionalWarning,
  };
}

export function validateMvpInputQuality({
  ventureName,
  idea,
  targetUsers,
  problem,
}: {
  ventureName?: string;
  idea?: string;
  targetUsers?: string;
  problem?: string;
}) {
  const vName = (ventureName || "").trim();
  const vUsers = (targetUsers || "").trim();
  const vIdea = (idea || "").trim();
  const vProblem = (problem || "").trim();

  // 1. Basic length check
  if (vName.length < 2 || vUsers.length < 3 || vIdea.length < 6 || vProblem.length < 6) {
    return {
      valid: false,
      message:
        "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normName = normalize(vName);
  const normUsers = normalize(vUsers);
  const normIdea = normalize(vIdea);
  const normProblem = normalize(vProblem);

  // 2. Meaningful difference check (Identical or near-identical text)
  const fields = [normName, normUsers, normIdea, normProblem];
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const f1 = fields[i];
      const f2 = fields[j];
      if (f1 === f2 && f1.length > 2) {
        return {
          valid: false,
          message:
            "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
        };
      }
      if (f1.length > 5 && f2.length > 5) {
        if ((f1.includes(f2) || f2.includes(f1)) && Math.abs(f1.length - f2.length) < 4) {
          return {
            valid: false,
            message:
              "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
          };
        }
      }
    }
  }

  // 3. Generic Target Users check (Must be a specific persona, not just 'founders' or 'users')
  const genericUsersList = [
    "users",
    "user",
    "founders",
    "founder",
    "people",
    "person",
    "customers",
    "customer",
    "everyone",
    "anyone",
    "anybody",
    "someone",
    "clients",
    "client",
    "startups",
    "startup",
    "all users",
    "all people",
    "target users",
    "target customers",
    "target customer segments",
    "early stage founders",
    "early stage startups",
    "b2b founders",
    "b2c users",
  ];

  if (genericUsersList.includes(normUsers) || (normUsers.split(" ").length === 1 && genericUsersList.includes(normUsers))) {
    return {
      valid: false,
      message:
        "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  // 4. Vague / Generic Idea or Problem Check
  const genericPhrases = [
    "i am solving the problem for founders",
    "solving the problem for founders",
    "solving problem for founders",
    "helping people",
    "helping users",
    "helping founders",
    "making things easier",
    "make things easier",
    "solving problems",
    "solving customer problem",
    "an app",
    "a website",
    "ai app",
    "ai platform",
    "ai startup",
    "platform",
    "good idea",
    "something cool",
    "solve pain",
    "core customer problem",
    "startup concept",
    "new startup idea",
    "validated startup idea",
  ];

  if (genericPhrases.includes(normIdea) || genericPhrases.includes(normProblem)) {
    return {
      valid: false,
      message:
        "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  if (normProblem.split(" ").length < 3 || normIdea.split(" ").length < 3) {
    return {
      valid: false,
      message:
        "This doesn't look like real Idea Validation data — the fields are empty, duplicated, or too generic to scope an MVP from. Please complete Idea Validation properly first, or re-enter your actual startup details.",
    };
  }

  return { valid: true, message: "" };
}

function MvpScopePage() {
  const { venture, update } = useActiveVenture();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [inputQualityError, setInputQualityError] = useState<string | null>(null);

  // Form Inputs (clean state - auto-inherits from Venture Memory if present)
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [ideaInput, setIdeaInput] = useState("");
  const [targetUsersInput, setTargetUsersInput] = useState("");
  const [problemInput, setProblemInput] = useState("");

  // Scope Data
  const [blueprint, setBlueprint] = useState<GeneratedScope | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const ventureId = venture?.id || (venture as any)?._id || "6a709d6ff4af39139e040cc8";
  const hasVentureMemory = Boolean(venture?.brief?.building || venture?.brief?.problem || venture?.name);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setIdeaInput(venture.brief?.building || "");
      setTargetUsersInput(venture.brief?.audience || "");
      setProblemInput(venture.brief?.problem || "");
      loadMvpScopeHistory();
    } else {
      loadMvpScopeHistory();
    }
  }, [ventureId]);

  async function loadMvpScopeHistory() {
    setLoading(true);
    try {
      const res = await api.getMvpScopeHistory(ventureId);
      if (res.success && res.data?.mvpScope) {
        const formatted = formatScopeBlueprint(res.data.mvpScope, ventureNameInput, ideaInput, targetUsersInput, problemInput);
        setBlueprint(formatted);
        setHistory(res.data.history || []);
      } else {
        setBlueprint(null);
      }
    } catch (err) {
      console.warn("Failed to load MVP scope history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateMvpBlueprint(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;

    const resolvedName = ventureNameInput || venture?.name || "";
    const resolvedIdea = ideaInput || venture?.brief?.building || "";
    const resolvedUsers = targetUsersInput || venture?.validationState?.answers?.question1 || venture?.brief?.audience || "";
    const resolvedProblem = problemInput || venture?.validationState?.answers?.question1 || venture?.brief?.problem || "";

    // Input Quality Check
    const qualityCheck = validateMvpInputQuality({
      ventureName: resolvedName,
      idea: resolvedIdea,
      targetUsers: resolvedUsers,
      problem: resolvedProblem,
    });

    if (!qualityCheck.valid) {
      setInputQualityError(qualityCheck.message);
      toast.error(qualityCheck.message);
      return;
    }

    setInputQualityError(null);
    setGenerating(true);
    try {
      const res = await api.generateMvpScopeModule({
        ventureId,
        ventureName: resolvedName,
        idea: resolvedIdea,
        targetUsers: resolvedUsers,
        problem: resolvedProblem,
        alternatives: venture?.validationState?.answers?.question2 || venture?.brief?.workaround,
        painFrequency: venture?.validationState?.answers?.question3 || venture?.brief?.outcome,
        differentiation: venture?.validationState?.answers?.question4,
        evidence: venture?.validationState?.answers?.question5,
        validationScore: venture?.ideaScore?.overallScore,
        weakestCategory: (venture?.ideaScore as any)?.weakestCategory,
      });

      if (res.success && res.data?.mvpScope) {
        const formatted = formatScopeBlueprint(res.data.mvpScope, resolvedName, resolvedIdea, resolvedUsers, resolvedProblem);
        setBlueprint(formatted);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.mvpScope, ...prev]);
        }
      } else if (res.message) {
        setInputQualityError(res.message);
        toast.error(res.message);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to generate MVP blueprint";
      setInputQualityError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 02"
        title="MVP Scope Architect"
        description="Transform customer pain into a 12-part technical MVP blueprint, ruthless feature prioritization, and realistic 2-week launch milestones."
        right={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#101417] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[rgba(139,92,246,0.3)] text-xs text-[#cbc3d7]">
                <History className="size-3.5 text-[#A78BFA]" />
                <span className="font-mono text-xs text-white">{history.length} Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateMvpBlueprint()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] px-3.5 sm:px-4 py-2 text-xs font-bold text-black transition shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              <span>{generating ? "Generating..." : "Generate MVP Blueprint"}</span>
            </button>
          </div>
        }
      />

      {/* Venture Memory & Validation Gating Banner */}
      {venture?.ideaScore && venture.ideaScore.overallScore >= 60 ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-4 text-xs text-white shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-[#A78BFA]" />
            <div>
              <span className="font-bold text-[#A78BFA]">Idea Validation Complete (Score: {venture.ideaScore.overallScore}/100): </span>
              {venture.ideaScore.verdict || "Your venture parameters and customer pain signals are locked in. Ready to scope your precision MVP."}
            </div>
          </div>
          <LinkButton to="/workspace/idea-validation" variant="secondary" className="text-xs shrink-0">
            View Validation
          </LinkButton>
        </div>
      ) : venture?.ideaScore && venture.ideaScore.overallScore > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-white shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-amber-400">Heads up: </span>
              Your validation score was on the lower side ({venture.ideaScore.overallScore}/100). We can scope this MVP, but consider this provisional until you've gathered more evidence.
            </div>
          </div>
          <LinkButton to="/workspace/idea-validation" variant="secondary" className="text-xs shrink-0">
            Gather Evidence
          </LinkButton>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#101417] p-4 text-xs text-[#cbc3d7] shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-[#A78BFA]" />
            <div>
              <span className="font-bold text-[#A78BFA]">Validation Required: </span>
              MVP Scope builds directly on your Idea Validation — I don't have that yet. Let's finish validating the idea first so the MVP actually targets a real, proven problem.
            </div>
          </div>
          <LinkButton to="/workspace/idea-validation" variant="primary" className="text-xs shrink-0">
            Validate Idea
          </LinkButton>
        </div>
      )}

      {/* Input Quality Rejection Banner */}
      {inputQualityError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-white shadow-lg">
          <ShieldAlert className="size-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-300">Input Quality Warning:</span>
            <p className="text-rose-200 leading-relaxed">{inputQualityError}</p>
          </div>
        </div>
      )}

      {/* Input Parameters Form */}
      <Panel title="Startup Scope Inputs">
        <form onSubmit={handleGenerateMvpBlueprint} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="e.g. Acme AI or leave blank"
              />
            </Field>
            <Field label="Target Users">
              <TextInput
                value={targetUsersInput}
                onChange={(e) => setTargetUsersInput(e.target.value)}
                placeholder="e.g. Early-Stage Founders, Solo Builders"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startup Idea">
              <TextArea
                rows={2}
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="Describe your core product idea"
              />
            </Field>
            <Field label="Core Problem Solved">
              <TextArea
                rows={2}
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="Describe the primary customer pain point"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] px-5 py-2.5 text-xs font-extrabold text-black transition disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.4)] cursor-pointer"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Analyzing Idea..." : "Generate MVP Scope Blueprint"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading Animation */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#A78BFA]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white">Scoping Precision MVP Plan...</h3>
            <p className="text-xs font-mono text-[#958ea0]">Testing core assumptions, cutting scope bloat, and drafting the 2-week v1 loop</p>
          </div>
        </div>
      )}

      {/* Blueprint Display */}
      {blueprint && !generating && (
        <div className="space-y-6">
          {/* Header Badge & Provisional Flag */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2.5 py-1 rounded-lg border border-[rgba(139,92,246,0.3)]">
                  FounderOS MVP Scope Blueprint
                </span>
                <h2 className="text-2xl font-extrabold font-display text-white mt-2">{blueprint.mvpName}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white bg-[rgba(139,92,246,0.15)] px-3 py-1.5 rounded-xl border border-[rgba(139,92,246,0.3)]">
                  Estimate: {blueprint.buildEstimate}
                </span>
              </div>
            </div>

            {blueprint.provisionalWarning && (
              <div className="flex items-start gap-2.5 mt-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{blueprint.provisionalWarning}</span>
              </div>
            )}
          </div>

          {/* 1. Core Assumption to Test */}
          <Panel title="1. Core Assumption to Test">
            <div className="rounded-xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] p-4 sm:p-5 text-xs text-white space-y-2">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#A78BFA] uppercase">
                <ShieldAlert className="size-4 text-[#A78BFA]" />
                <span>Riskiest Hypothesis That Kills The Idea If Wrong</span>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {blueprint.coreAssumption}
              </p>
            </div>
          </Panel>

          {/* 2. Must-Have Features (v1 only) & 3. Cut List */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Must Have Features */}
            <Panel title="2. Must-Have Features (v1 Only — Core Loop)">
              <div className="space-y-3">
                <p className="text-xs text-[#cbc3d7]">
                  Strictly capped at essential features required for real users to complete the core value loop:
                </p>
                <ul className="space-y-2.5">
                  {blueprint.mustHaveFeatures?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white bg-[#101417] p-3 rounded-xl border border-[rgba(139,92,246,0.25)]">
                      <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            {/* Cut List */}
            <Panel title="3. Explicitly Excluded (Cut List)">
              <div className="space-y-3">
                <p className="text-xs text-[#cbc3d7]">
                  Features tempting to add, deferred to v2 to protect velocity and accelerate first user signal:
                </p>
                <ul className="space-y-2.5">
                  {blueprint.cutList?.map((item, i) => (
                    <li key={i} className="flex flex-col gap-1 text-xs text-[#cbc3d7] bg-[#101417] p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <span className="size-2 rounded-full bg-rose-400/80 shrink-0" />
                        <span>{item.feature}</span>
                      </div>
                      <p className="text-[11px] text-[#958ea0] pl-4">Why cut: {item.reasonDeferred}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          </div>

          {/* 4. Core User Flow */}
          <Panel title="4. Core User Flow (Step-by-Step)">
            <div className="grid gap-3 sm:grid-cols-3">
              {blueprint.coreUserFlow?.map((step, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#101417] p-4 text-xs">
                  <span className="font-mono text-[10px] font-bold text-[#A78BFA] uppercase">Step {i + 1}</span>
                  <p className="font-semibold text-white leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* 5. Build Estimate & 6. Success Metric */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Build Estimate & Engineering Risks */}
            <Panel title="5. Build Estimate & Technical Feasibility">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-[#101417] p-3.5 border border-white/5">
                  <span className="text-xs text-[#cbc3d7]">Estimated Build Window:</span>
                  <span className="font-mono text-xs font-bold text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2.5 py-1 rounded-lg border border-[rgba(139,92,246,0.3)]">
                    {blueprint.buildEstimate}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-[#958ea0] uppercase tracking-wider">Engineering Risk Assessment</p>
                  {blueprint.engineeringRisks?.map((risk, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 text-xs bg-[#101417] p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="font-semibold text-white block">{risk.component}</span>
                        <span className="text-[11px] text-[#cbc3d7]">{risk.details}</span>
                      </div>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                        risk.riskLevel === "High" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        risk.riskLevel === "Medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        {risk.riskLevel} Risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* 6. Success Metric */}
            <Panel title="6. Success Metric (Proof of Outcome)">
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-white space-y-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase block">Single Core Success Metric</span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    {blueprint.successMetric}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-[#958ea0] uppercase tracking-wider">Supporting Signal Checks</p>
                  <ul className="space-y-2">
                    {blueprint.successMetrics?.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white bg-[#101417] p-2.5 rounded-xl border border-white/5">
                        <CheckCircle2 className="size-3.5 text-[#A78BFA] shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* Empty State Banner when no blueprint has been generated yet */}
      {!blueprint && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b0f12] p-12 text-center space-y-3">
          <Layers className="size-10 text-[#A78BFA]/60" />
          <h3 className="text-base font-bold text-white">No MVP Scope Blueprint Generated Yet</h3>
          <p className="max-w-md text-xs text-[#cbc3d7] font-sans">
            Review your startup parameters in the form above, then click <strong>Generate MVP Blueprint</strong> to construct your 6-part technical scope, core hypothesis, cut list, and 2-week launch milestones.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button
          onClick={() => {
            if (blueprint) {
              update((v) => ({
                ...v,
                mvp: {
                  coreProblem: problemInput,
                  job: targetUsersInput,
                  promise: ideaInput,
                  outcome: blueprint.coreFeatures.join(", "),
                  buildNow: blueprint.mustHaveFeatures,
                  later: blueprint.niceToHaveFeatures,
                  target: blueprint.buildEstimate || "Two weeks",
                },
                mvpScope: {
                  ...((v as any).mvpScope || {}),
                  coreAssumption: blueprint.coreAssumption,
                  mustHaveFeatures: blueprint.mustHaveFeatures,
                  cutList: blueprint.cutList,
                  featuresToAvoid: blueprint.featuresToAvoid,
                  coreFeatures: blueprint.coreFeatures,
                  coreUserFlow: blueprint.coreUserFlow,
                  userJourney: blueprint.userJourney,
                  buildEstimate: blueprint.buildEstimate,
                  engineeringRisks: blueprint.engineeringRisks,
                  technicalRequirements: blueprint.technicalRequirements,
                  successMetric: blueprint.successMetric,
                  successMetrics: blueprint.successMetrics,
                  isSaved: true,
                },
              }));
              toast.success("MVP Scope saved! Unlocked Stage 3: Roadmap");
              setTimeout(() => {
                navigate({ to: "/workspace/build-roadmap" as any });
              }, 400);
            } else {
              toast.info("Please generate an MVP Scope blueprint first.");
            }
          }}
        >
          Save MVP Scope & Continue
        </Button>
        <LinkButton to="/workspace/build-roadmap" variant="primary">
          Continue to Build Roadmap
        </LinkButton>
      </div>
    </>
  );
}