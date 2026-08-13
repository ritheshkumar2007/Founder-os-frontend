import { createFileRoute } from "@tanstack/react-router";
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
  coreFeatures: string[];
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  featuresToAvoid: string[];
  userJourney: string[];
  technicalRequirements: string[];
  developmentTimeline: { phase: string; duration: string; tasks: string[] }[];
  successMetrics: string[];
  futureRoadmap: string[];
}

function formatScopeBlueprint(raw: any, fallbackName: string, ideaText: string, audienceText: string, problemText: string): GeneratedScope {
  const scope = raw?.generatedScope || raw?.mvpScope || raw || {};
  const problem = problemText || scope.problemSolved || scope.coreCustomerProblem || "primary customer pain";
  const audience = audienceText || scope.targetUsers || "target customers";

  const coreFeatures = (Array.isArray(scope.coreFeatures) && scope.coreFeatures.length > 0)
    ? scope.coreFeatures
    : [
        `Core Workflow Engine resolving ${problem}`,
        `Direct User Intake & Setup for ${audience}`,
        `Automated Outcome Delivery & Results Dashboard`,
      ];

  const mustHaveFeatures = (Array.isArray(scope.mustHaveFeatures) && scope.mustHaveFeatures.length > 0)
    ? scope.mustHaveFeatures
    : [
        "User Session Authentication & Security",
        "Dashboard Output & Task Tracking",
        "Real-Time AI Processing Engine",
        "Responsive Mobile & Desktop Interface",
      ];

  const niceToHaveFeatures = (Array.isArray(scope.niceToHaveFeatures) && scope.niceToHaveFeatures.length > 0)
    ? scope.niceToHaveFeatures
    : [
        "Exportable PDF Summary Reports",
        "Custom Webhook Notifications",
        "Team Collaboration & Shareable Links",
      ];

  const featuresToAvoid = (Array.isArray(scope.featuresToAvoid) && scope.featuresToAvoid.length > 0)
    ? scope.featuresToAvoid
    : (Array.isArray(scope.excludedFeatures) && scope.excludedFeatures.length > 0)
      ? scope.excludedFeatures
      : [
          "Premature Microservices Architecture",
          "Complex Custom Billing Rules",
          "Native Mobile Application Wrappers",
        ];

  const userJourney = (Array.isArray(scope.userJourney) && scope.userJourney.length > 0)
    ? scope.userJourney
    : [
        `Step 1: ${audience} inputs problem details.`,
        `Step 2: Core resolution engine analyzes parameters.`,
        `Step 3: Actionable output delivered to user dashboard.`,
      ];

  const technicalRequirements = (Array.isArray(scope.technicalRequirements) && scope.technicalRequirements.length > 0)
    ? scope.technicalRequirements
    : [
        "React + Vite + TypeScript Frontend",
        "Node.js + Express Backend Server",
        "MongoDB Atlas Database Storage",
        "Gemini 1.5 Flash AI Engine API",
      ];

  const developmentTimeline = (Array.isArray(scope.developmentTimeline) && scope.developmentTimeline.length > 0)
    ? scope.developmentTimeline
    : [
        {
          phase: "Phase 1: Architecture & Data Schema Setup",
          duration: "Days 1–3",
          tasks: ["Configure MongoDB Models", "Setup Auth Middleware", "Deploy Express Routes"],
        },
        {
          phase: "Phase 2: Core Feature & AI Engine Integration",
          duration: "Days 4–9",
          tasks: [`Build direct resolution engine for ${problem}`, "Build Workspace Panels", "Wire Store State"],
        },
        {
          phase: "Phase 3: Testing & Production Deployment",
          duration: "Days 10–14",
          tasks: ["Conduct End-to-End Testing", "Deploy Backend on Render", "Deploy Frontend on Vercel"],
        },
      ];

  const successMetrics = (Array.isArray(scope.successMetrics) && scope.successMetrics.length > 0)
    ? scope.successMetrics
    : [
        "10 Initial Customer Testing Sessions",
        "80% Core Feature Completion Rate",
        "<2s Response Latency on AI Outputs",
      ];

  const futureRoadmap = (Array.isArray(scope.futureRoadmap) && scope.futureRoadmap.length > 0)
    ? scope.futureRoadmap
    : [
        "v2.0: Enterprise SSO Integration",
        "v2.1: Automated GitHub Repository Scaffolding",
        "v2.2: Native Mobile Companion App",
      ];

  return {
    mvpName: scope.mvpName || `${fallbackName || "FounderOS"} Core MVP`,
    coreFeatures,
    mustHaveFeatures,
    niceToHaveFeatures,
    featuresToAvoid,
    userJourney,
    technicalRequirements,
    developmentTimeline,
    successMetrics,
    futureRoadmap,
  };
}

function MvpScopePage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

    setGenerating(true);
    try {
      const res = await api.generateMvpScopeModule({
        ventureId,
        ventureName: ventureNameInput || "Untitled Venture",
        idea: ideaInput || "Startup Concept",
        targetUsers: targetUsersInput || "Target Customers",
        problem: problemInput || "Core Customer Problem",
      });

      if (res.success && res.data?.mvpScope) {
        const formatted = formatScopeBlueprint(res.data.mvpScope, ventureNameInput, ideaInput, targetUsersInput, problemInput);
        setBlueprint(formatted);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.mvpScope, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to generate MVP blueprint:", err);
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
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#101417] px-3 py-1.5 rounded-xl border border-[rgba(139,92,246,0.3)] text-xs text-[#cbc3d7]">
                <History className="size-3.5 text-[#A78BFA]" />
                <span className="font-mono text-xs text-white">{history.length} Generations Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateMvpBlueprint()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] px-4 py-2 text-xs font-bold text-black transition shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Generating Blueprint..." : "Generate MVP Blueprint"}
            </button>
          </div>
        }
      />

      {/* Venture Memory Context Banner */}
      {hasVentureMemory ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-4 text-xs text-white shadow-sm">
          <Sparkles className="size-5 shrink-0 text-[#A78BFA]" />
          <div>
            <span className="font-bold text-[#A78BFA]">Venture Memory Connected: </span>
            Auto-inherited your validated idea and target audience from Step 1. You can edit parameters below or generate your 12-part technical MVP blueprint.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#101417] p-4 text-xs text-[#cbc3d7] shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-[#A78BFA]" />
          <div>
            <span className="font-bold text-[#A78BFA]">No Venture Memory Recorded: </span>
            Input your startup details in the form below or complete Step 1 (Idea Validation) to auto-populate your parameters.
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
            <h3 className="text-sm font-bold text-white">Designing Your Realistic MVP Scope...</h3>
            <p className="text-xs font-mono text-[#958ea0]">Analyzing core features, user journey, technical requirements, and 2-week timeline</p>
          </div>
        </div>
      )}

      {/* Blueprint Display */}
      {blueprint && !generating && (
        <div className="space-y-6">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-6 shadow-2xl">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2.5 py-1 rounded-lg border border-[rgba(139,92,246,0.3)]">
                Generated MVP Blueprint
              </span>
              <h2 className="text-2xl font-extrabold font-display text-white mt-2">{blueprint.mvpName}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white bg-[rgba(139,92,246,0.15)] px-3 py-1.5 rounded-xl border border-[rgba(139,92,246,0.3)]">
                Status: Ready to Build
              </span>
            </div>
          </div>

          {/* 4 Feature Categorization Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Core MVP Features">
              <ul className="space-y-2">
                {blueprint.coreFeatures?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-white bg-[#101417] p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Must-Have Features (Build First)">
              <ul className="space-y-2">
                {blueprint.mustHaveFeatures?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-white bg-[#101417] p-3 rounded-xl border border-[rgba(139,92,246,0.3)]">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Nice-to-Have Features (v1.1)">
              <ul className="space-y-2">
                {blueprint.niceToHaveFeatures?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#cbc3d7] bg-[#101417] p-3 rounded-xl border border-white/5">
                    <span className="size-2 rounded-full bg-[#A78BFA] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Features to Avoid (Scope Creep)">
              <ul className="space-y-2">
                {blueprint.featuresToAvoid?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#cbc3d7] bg-[#101417] p-3 rounded-xl border border-white/10">
                    <ShieldAlert className="size-4 text-[#A78BFA] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* User Journey Steps */}
          <Panel title="User Journey (Primary Workflow)">
            <div className="grid gap-3 sm:grid-cols-3">
              {blueprint.userJourney?.map((step, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#101417] p-4 text-xs">
                  <span className="font-mono text-[10px] font-bold text-[#A78BFA] uppercase">Step {i + 1}</span>
                  <p className="font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Technical Requirements & Success Metrics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Technical Requirements">
              <div className="flex flex-wrap gap-2">
                {blueprint.technicalRequirements?.map((req, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-[#101417] px-3 py-2 text-xs font-mono text-white">
                    <Cpu className="size-3.5 text-[#A78BFA]" />
                    {req}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel title="Success Metrics (KPIs)">
              <ul className="space-y-2">
                {blueprint.successMetrics?.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-semibold text-white bg-[#101417] p-3 rounded-xl border border-[rgba(139,92,246,0.25)]">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Timeline Visualization */}
          <Panel title="Development Timeline Visualization">
            <div className="space-y-4">
              {blueprint.developmentTimeline?.map((t, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-[#101417] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{t.phase}</span>
                    <span className="font-mono text-[11px] text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2.5 py-1 rounded-lg border border-[rgba(139,92,246,0.3)]">
                      {t.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {t.tasks?.map((task, ti) => (
                      <span key={ti} className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-[#cbc3d7]">
                        • {task}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Future Roadmap */}
          <Panel title="Post-Launch Future Roadmap">
            <div className="grid gap-3 sm:grid-cols-3">
              {blueprint.futureRoadmap?.map((item, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-[#101417] p-3 text-xs text-[#cbc3d7] font-mono">
                  <span className="text-[#A78BFA] font-bold">v2.{i + 1}: </span>{item}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* Empty State Banner when no blueprint has been generated yet */}
      {!blueprint && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b0f12] p-12 text-center space-y-3">
          <Layers className="size-10 text-[#A78BFA]/60" />
          <h3 className="text-base font-bold text-white">No MVP Scope Blueprint Generated Yet</h3>
          <p className="max-w-md text-xs text-[#cbc3d7] font-sans">
            Review your startup parameters in the form above, then click <strong>Generate MVP Blueprint</strong> to construct your 12-part technical scope, feature priorities, and 2-week timeline.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save MVP Scope</Button>
        <LinkButton to="/workspace/build-roadmap" variant="primary">
          Continue to Build Roadmap
        </LinkButton>
      </div>
    </>
  );
}