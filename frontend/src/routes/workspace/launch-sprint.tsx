import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, CopyButton, Empty, Field, LinkButton, PageHeader, Panel, Progress, Stat, TextArea, TextInput } from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Clock, CheckCircle2, Calendar, Target, ShieldAlert, Rocket, History, Users, ArrowRight, AlertTriangle, AlertCircle } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Launch Sprint — FounderOS";
const DESCRIPTION = "AI Launch Manager designs a venture-aware, evidence-based launch sprint, task matrix, and risk mitigation.";

export const Route = createFileRoute("/workspace/launch-sprint")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SprintPage,
});

export interface SprintPlanData {
  launchOverview?: {
    ventureName: string;
    currentStage: string;
    launchObjective: string;
    launchDate: string;
    launchStatus: string;
    customerEvidence: string;
  };
  preLaunch: { day: string; tasks: string[]; owner: string; status?: string; reason?: string; objective?: string; done?: boolean }[];
  launchDay: { time: string; activity: string; responsibility: string; done?: boolean }[];
  postLaunch: { week: string; actions: string[]; expectedResult: string }[];
  contentSchedule: { platform: string; content: string; date: string }[];
  communityStrategy: string[];
  userAcquisitionPlan: string[];
  launchMetrics: { metric: string; target: string }[];
  riskManagement: { risk: string; solution: string }[];
  nextAction?: string;
}

function formatLaunchSprintPlan(raw: any, ventureNameInput: string, launchDateInput: string, launchGoalInput: string): SprintPlanData {
  const data = raw?.launchSprint?.sprintPlan || raw?.sprintPlan || raw || {};
  const hasRealDate = Boolean(launchDateInput && launchDateInput.trim() && !launchDateInput.includes("7 days") && launchDateInput !== "Not set");
  const launchDateLabel = hasRealDate ? launchDateInput : "Launch date: Not set";

  const preLaunch = (Array.isArray(data.preLaunch) && data.preLaunch.length > 0)
    ? data.preLaunch
    : [
        {
          day: hasRealDate ? "T-5 Days" : "Pre-Launch Task 1",
          tasks: ["Verify core MVP workflow and user intake", "Test onboarding sequence with 5 test users"],
          owner: "Founder",
          status: "Recommended",
          reason: "Ensure core value delivery works before public exposure.",
        },
        {
          day: hasRealDate ? "T-2 Days" : "Pre-Launch Task 2",
          tasks: ["Prepare feedback collection form", "Verify analytics tracking endpoints"],
          owner: "Founder",
          status: "Not Started",
          reason: "Capture early user retention signals.",
        },
      ];

  const launchDay = (Array.isArray(data.launchDay) && data.launchDay.length > 0)
    ? data.launchDay
    : [
        {
          time: "Launch Day Priorities",
          activity: "Publish launch announcement on primary Marketing Plan channels",
          responsibility: "Founder",
        },
        {
          time: "Launch Day Priorities",
          activity: "Direct 1-on-1 outreach to pre-identified target users",
          responsibility: "Founder",
        },
      ];

  const postLaunch = (Array.isArray(data.postLaunch) && data.postLaunch.length > 0)
    ? data.postLaunch
    : [
        {
          week: "Week +1",
          actions: ["Conduct 1-on-1 feedback interviews with active test users", "Deploy rapid bug patches"],
          expectedResult: "Verify if test users repeatedly use the product.",
        },
      ];

  const contentSchedule = (Array.isArray(data.contentSchedule) && data.contentSchedule.length > 0)
    ? data.contentSchedule
    : [
        {
          platform: "Primary Channel (Marketing Plan)",
          content: `Launch Announcement: Introducing ${ventureNameInput || "our startup"} to target users`,
          date: "Launch Day",
        },
      ];

  const communityStrategy = (Array.isArray(data.communityStrategy) && data.communityStrategy.length > 0)
    ? data.communityStrategy
    : ["Engage directly in target communities where target customers seek solutions."];

  const userAcquisitionPlan = (Array.isArray(data.userAcquisitionPlan) && data.userAcquisitionPlan.length > 0)
    ? data.userAcquisitionPlan
    : ["Direct 1-on-1 outreach based on Marketing Plan channels."];

  const launchMetrics = (Array.isArray(data.launchMetrics) && data.launchMetrics.length > 0)
    ? data.launchMetrics
    : [
        {
          metric: "Initial Test Users",
          target: launchGoalInput && launchGoalInput !== "Launch target: Not defined"
            ? `Founder-defined launch target: ${launchGoalInput}`
            : "Suggested launch target: 20–50 initial users",
        },
        {
          metric: "Core Workflow Completion Rate",
          target: "Suggested launch target: 60% activation rate",
        },
      ];

  const riskManagement = (Array.isArray(data.riskManagement) && data.riskManagement.length > 0)
    ? data.riskManagement
    : [
        {
          risk: "Low activation or user drop-off",
          solution: "Conduct direct 1-on-1 feedback sessions to identify onboarding friction.",
        },
        {
          risk: "Weak product-market signal",
          solution: "Iterate core MVP feature based strictly on customer validation quotes.",
        },
      ];

  const nextAction = data.nextAction || "Next Action: Complete MVP core testing with 5–10 target users.";

  return {
    preLaunch,
    launchDay,
    postLaunch,
    contentSchedule,
    communityStrategy,
    userAcquisitionPlan,
    launchMetrics,
    riskManagement,
    nextAction,
    launchOverview: data.launchOverview || {
      ventureName: ventureNameInput || "Untitled Venture",
      currentStage: "Early-Stage Execution",
      launchObjective: launchGoalInput && launchGoalInput !== "Launch target: Not defined"
        ? `Founder-defined launch target: ${launchGoalInput}`
        : "Suggested launch target: Acquire 20–50 initial test users",
      launchDate: launchDateLabel,
      launchStatus: "Ready for launch testing",
      customerEvidence: "Customer interview evidence: Not yet recorded.",
    },
  };
}

function SprintPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs (clean inputs - auto-inherits from Venture Memory if present)
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [ideaInput, setIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [marketingPlanInput, setMarketingPlanInput] = useState("");
  const [launchDateInput, setLaunchDateInput] = useState("");
  const [launchGoalInput, setLaunchGoalInput] = useState("");

  // Sprint Plan Data
  const [sprintPlan, setSprintPlan] = useState<SprintPlanData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const ventureId = venture?.id || (venture as any)?._id || "6a709d6ff4af39139e040cc8";
  const hasVentureMemory = Boolean(venture?.brief?.building || venture?.marketingPlan?.marketingStrategy || venture?.name);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setIdeaInput(venture.brief?.building || "");
      setMvpScopeInput(venture.mvpScope?.mustHaveFeatures?.join(", ") || venture.mvp?.job || "");
      setMarketingPlanInput(venture.marketingPlan?.brandPositioning || "");
      loadLaunchSprintHistory();
    } else {
      loadLaunchSprintHistory();
    }
  }, [ventureId]);

  async function loadLaunchSprintHistory() {
    setLoading(true);
    try {
      const res = await api.getLaunchSprintHistory(ventureId);
      if (res.success && res.data?.launchSprint) {
        const formatted = formatLaunchSprintPlan(res.data.launchSprint, ventureNameInput, launchDateInput, launchGoalInput);
        setSprintPlan(formatted);
        setHistory(res.data.history || []);
      } else {
        setSprintPlan(null);
      }
    } catch (err) {
      console.warn("Failed to load launch sprint history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLaunchSprint(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;

    setGenerating(true);
    try {
      const res = await api.generateLaunchSprintModule({
        ventureId,
        ventureName: ventureNameInput || "Untitled Venture",
        idea: ideaInput || "Startup Concept",
        mvpScope: mvpScopeInput || "2-week core MVP scope",
        marketingPlan: marketingPlanInput || "Inherited from Marketing Plan",
        launchDate: launchDateInput || "Not set",
        launchGoal: launchGoalInput || "Launch target: Not defined",
        targetAudience: venture?.brief?.audience || "Target Customers",
      });

      if (res.success && res.data?.launchSprint) {
        const formatted = formatLaunchSprintPlan(res.data.launchSprint, ventureNameInput, launchDateInput, launchGoalInput);
        setSprintPlan(formatted);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.launchSprint, ...prev]);
        }
      } else {
        const formatted = formatLaunchSprintPlan({}, ventureNameInput, launchDateInput, launchGoalInput);
        setSprintPlan(formatted);
      }
    } catch (err) {
      console.warn("Failed to generate launch sprint:", err);
      const formatted = formatLaunchSprintPlan({}, ventureNameInput, launchDateInput, launchGoalInput);
      setSprintPlan(formatted);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 07"
        title="Venture Launch Sprint Generator"
        description="Evidence-based launch execution plan, task matrix, channel distribution, and risk mitigation connected to your venture memory."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Sprints Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateLaunchSprint()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(100,216,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "AI Is Planning Sprint..." : "Generate Launch Sprint"}
            </button>
          </div>
        }
      />

      {/* Banner */}
      {hasVentureMemory ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
          <Sparkles className="size-5 shrink-0 text-[#64D8FF]" />
          <div>
            <span className="font-bold text-[#64D8FF]">Launch Sprint Agent Active: </span>
            Connected to Venture Memory, Brief, Validation, MVP Scope, Build Roadmap, and Marketing Plan.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold text-amber-300">No Venture Memory Recorded: </span>
            Input your launch parameters in the form below or complete previous steps to auto-populate channels and targets.
          </div>
        </div>
      )}

      {/* Form Inputs */}
      <Panel title="Launch Execution Inputs (Leave Blank if Not Set)">
        <form onSubmit={handleGenerateLaunchSprint} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="e.g. Acme SaaS or leave blank"
              />
            </Field>
            <Field label="Target Launch Date">
              <TextInput
                value={launchDateInput}
                onChange={(e) => setLaunchDateInput(e.target.value)}
                placeholder="e.g. 2026-09-15 (or leave blank for 'Not set')"
              />
            </Field>
            <Field label="Launch Target / Goal">
              <TextInput
                value={launchGoalInput}
                onChange={(e) => setLaunchGoalInput(e.target.value)}
                placeholder="e.g. Acquire 20–50 test users (or leave blank)"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startup Product Idea">
              <TextArea
                rows={2}
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="Describe your core product concept"
              />
            </Field>
            <Field label="Marketing Channels (Inherited from Marketing Plan)">
              <TextArea
                rows={2}
                value={marketingPlanInput}
                onChange={(e) => setMarketingPlanInput(e.target.value)}
                placeholder="Channels inherited from Marketing Plan module"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(79,140,255,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Planning Sprint..." : "Generate Launch Sprint"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#64D8FF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Generating Evidence-Based Launch Sprint...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Retrieving Venture Memory, Validation evidence, Marketing Plan channels, and MVP readiness</p>
          </div>
        </div>
      )}

      {/* Sprint Output Display */}
      {sprintPlan && !generating && (
        <div className="space-y-6">
          {/* Launch Overview Header Card */}
          {sprintPlan.launchOverview && (
            <div className="rounded-2xl border border-[#64D8FF]/40 bg-[#0E131C] p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
                    Launch Sprint Overview
                  </span>
                  <h2 className="text-xl font-extrabold text-[#F5F8FC] mt-1">{sprintPlan.launchOverview.ventureName}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-[#64D8FF] bg-[#64D8FF]/10 px-3 py-1 rounded-xl border border-[#64D8FF]/30">
                    {sprintPlan.launchOverview.launchDate}
                  </span>
                  <span className={`text-xs font-mono px-3 py-1 rounded-xl border ${sprintPlan.launchOverview.launchStatus.includes('Not ready') ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-[#46E3A3] bg-[#46E3A3]/10 border-[#46E3A3]/30'}`}>
                    Status: {sprintPlan.launchOverview.launchStatus}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-xl bg-[#141C28] p-3.5 border border-white/10 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#64D8FF] block font-bold">Launch Objective:</span>
                  <p className="text-[#F5F8FC] font-semibold">{sprintPlan.launchOverview.launchObjective}</p>
                </div>

                <div className="rounded-xl bg-[#141C28] p-3.5 border border-white/10 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#46E3A3] block font-bold">Customer Evidence Signal:</span>
                  <p className="text-[#A8B3C7]">{sprintPlan.launchOverview.customerEvidence}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-Launch Sprint Tasks */}
          <Panel title="Pre-Launch Sprint Tasks">
            <div className="space-y-3">
              {sprintPlan.preLaunch?.map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-[#64D8FF] font-mono text-sm">{item.day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#A8B3C7] bg-white/5 px-2 py-0.5 rounded-md">
                        Owner: {item.owner}
                      </span>
                      {item.status && (
                        <span className="text-[10px] font-mono text-[#46E3A3] bg-[#46E3A3]/10 px-2 py-0.5 rounded-md border border-[#46E3A3]/20">
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1 text-[#F5F8FC]">
                    {item.tasks?.map((t, ti) => (
                      <li key={ti} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-[#46E3A3] shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  {item.reason && (
                    <p className="text-[11px] text-[#A8B3C7] font-sans pt-1 italic">Reason: {item.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {/* Launch Day Priorities */}
          <Panel title="Launch Day Priorities">
            <div className="grid gap-3 sm:grid-cols-2">
              {sprintPlan.launchDay?.map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#64D8FF] uppercase">{item.time}</span>
                  <p className="font-semibold text-[#F5F8FC]">{item.activity}</p>
                  <span className="text-[10px] font-mono text-[#A8B3C7] block">Responsibility: {item.responsibility}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Content Schedule & Acquisition Plan */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Content Distribution Plan (Marketing Plan Channels)">
              <ul className="space-y-2 text-xs">
                {sprintPlan.contentSchedule?.map((c, i) => (
                  <li key={i} className="rounded-xl bg-[#141C28] p-3 border border-white/10 space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-[#64D8FF]">
                      <span>{c.platform}</span>
                      <span>{c.date}</span>
                    </div>
                    <p className="text-[#F5F8FC] font-semibold">{c.content}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="User Acquisition Tactics">
              <ul className="space-y-2 text-xs">
                {sprintPlan.userAcquisitionPlan?.map((plan, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <Rocket className="size-3.5 text-[#64D8FF] shrink-0" />
                    <span>{plan}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Metrics & Risk Management */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Launch Metrics & Goals">
              <div className="space-y-2 text-xs">
                {sprintPlan.launchMetrics?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-[#141C28] p-3 border border-white/10">
                    <span className="font-medium text-[#F5F8FC]">{m.metric}</span>
                    <span className="font-mono text-[11px] text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
                      {m.target}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Venture-Specific Risks & Mitigations">
              <div className="space-y-2 text-xs">
                {sprintPlan.riskManagement?.map((r, i) => (
                  <div key={i} className="rounded-xl bg-[#141C28] p-3 border border-red-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                      <ShieldAlert className="size-3.5 text-red-400 shrink-0" />
                      <span>{r.risk}</span>
                    </div>
                    <p className="text-[#A8B3C7] pl-5">{r.solution}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Next Action Footer Banner */}
          {sprintPlan.nextAction && (
            <div className="rounded-2xl border border-[#46E3A3]/40 bg-[#46E3A3]/10 p-5 shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="size-6 text-[#46E3A3] shrink-0" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#46E3A3] block">Next Action:</span>
                <p className="text-sm font-bold text-[#F5F8FC]">{sprintPlan.nextAction.replace(/^Next Action:\s*/i, "")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State Banner when no sprint has been generated yet */}
      {!sprintPlan && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0E131C] p-12 text-center space-y-3">
          <Rocket className="size-10 text-[#64D8FF]/60" />
          <h3 className="text-base font-bold text-[#F5F8FC]">No Launch Sprint Generated Yet</h3>
          <p className="max-w-md text-xs text-[#A8B3C7] font-sans">
            Review your launch parameters in the form above, or click <strong>Generate Launch Sprint</strong> to create an evidence-based task matrix, content plan, and risk mitigation roadmap.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Launch Sprint</Button>
        <LinkButton to="/workspace/traction" variant="primary">
          Continue to Traction Dashboard
        </LinkButton>
      </div>
    </>
  );
}