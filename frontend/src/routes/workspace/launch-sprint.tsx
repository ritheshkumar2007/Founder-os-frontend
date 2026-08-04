import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, CopyButton, Empty, Field, LinkButton, PageHeader, Panel, Progress, Stat, TextArea, TextInput } from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Clock, CheckCircle2, Calendar, Target, ShieldAlert, Rocket, History, Users, ArrowRight } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Launch Sprint — FounderOS";
const DESCRIPTION = "AI Launch Manager designs a complete launch sprint execution plan, countdown, content schedule, and risk management.";

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
  preLaunch: { day: string; tasks: string[]; owner: string; objective: string; done?: boolean }[];
  launchDay: { time: string; activity: string; responsibility: string; done?: boolean }[];
  postLaunch: { week: string; actions: string[]; expectedResult: string }[];
  contentSchedule: { platform: string; content: string; date: string }[];
  communityStrategy: string[];
  userAcquisitionPlan: string[];
  launchMetrics: { metric: string; target: string }[];
  riskManagement: { risk: string; solution: string }[];
}

function SprintPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [ideaInput, setIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [marketingPlanInput, setMarketingPlanInput] = useState("");
  const [launchDateInput, setLaunchDateInput] = useState("In 7 Days (Product Hunt)");
  const [launchGoalInput, setLaunchGoalInput] = useState("Acquire first 100 active users & 250 Product Hunt upvotes");

  // Sprint Plan Data
  const [sprintPlan, setSprintPlan] = useState<SprintPlanData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Task Completion Local State
  const [completedPreTasks, setCompletedPreTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "Untitled Venture");
      setIdeaInput(venture.brief?.building || "AI Execution Operating System for Founders");
      setMvpScopeInput(venture.mvp?.job || "2-week core MVP scope");
      setMarketingPlanInput("Direct LinkedIn 1-on-1 DMs & Product Hunt release");
      loadLaunchSprintHistory();
    }
  }, [venture?.id]);

  async function loadLaunchSprintHistory() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getLaunchSprintHistory(venture.id);
      if (res.success && res.data?.launchSprint) {
        setSprintPlan(res.data.launchSprint.sprintPlan || null);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load launch sprint history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLaunchSprint(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!venture?.id || generating) return;

    setGenerating(true);
    try {
      const res = await api.generateLaunchSprintModule({
        ventureId: venture.id,
        ventureName: ventureNameInput,
        idea: ideaInput,
        mvpScope: mvpScopeInput,
        marketingPlan: marketingPlanInput,
        launchDate: launchDateInput,
        launchGoal: launchGoalInput,
        targetAudience: venture.brief?.audience || "Early adopters",
      });

      if (res.success && res.data?.launchSprint) {
        setSprintPlan(res.data.launchSprint.sprintPlan);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.launchSprint, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to generate launch sprint:", err);
    } finally {
      setGenerating(false);
    }
  }

  function togglePreTask(taskId: string) {
    setCompletedPreTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  const totalPreTasks = sprintPlan?.preLaunch?.reduce((acc, p) => acc + (p.tasks?.length || 0), 0) || 0;
  const donePreTasks = Object.values(completedPreTasks).filter(Boolean).length;
  const progressPct = totalPreTasks > 0 ? Math.round((donePreTasks / totalPreTasks) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Step 07"
        title="Launch Sprint AI Generator"
        description="AI Launch Manager constructs a 7-day pre-launch checklist, launch day schedule, content calendar, and risk mitigations."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Saved Sprints</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateLaunchSprint()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#4F8CFF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(79,140,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Generating Sprint..." : "Generate Launch Sprint"}
            </button>
          </div>
        }
      />

      {/* Generated from Founder Conversation Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#4F8CFF]" />
        <div>
          <span className="font-bold text-[#4F8CFF]">AI Launch Manager Active: </span>
          Input your target launch date & launch goals below to generate a command-center launch execution plan stored in MongoDB.
        </div>
      </div>

      {/* Inputs Form */}
      <Panel title="Launch Command Center Inputs">
        <form onSubmit={handleGenerateLaunchSprint} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="Venture name"
              />
            </Field>
            <Field label="Target Launch Date">
              <TextInput
                value={launchDateInput}
                onChange={(e) => setLaunchDateInput(e.target.value)}
                placeholder="e.g. In 7 Days (Product Hunt)"
              />
            </Field>
            <Field label="Marketing Strategy">
              <TextInput
                value={marketingPlanInput}
                onChange={(e) => setMarketingPlanInput(e.target.value)}
                placeholder="Marketing strategy summary"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startup Idea & MVP Scope">
              <TextArea
                rows={2}
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="Startup idea overview"
              />
            </Field>
            <Field label="Primary Launch Goal">
              <TextArea
                rows={2}
                value={launchGoalInput}
                onChange={(e) => setLaunchGoalInput(e.target.value)}
                placeholder="Acquire 100 active users & Product Hunt top 5"
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

      {/* Loading Animation */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#4F8CFF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#4F8CFF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Constructing Launch Sprint Execution Plan...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Building pre-launch checklist, hour-by-hour launch day timeline, content schedule, and risk mitigations</p>
          </div>
        </div>
      )}

      {/* 8 Components Command Center Display */}
      {sprintPlan && !generating && (
        <div className="space-y-6">
          {/* Component 1 & 2: Launch Overview Card & Countdown Timer */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Component 1: Launch Overview Card */}
            <div className="rounded-2xl border border-[#4F8CFF]/30 bg-[#0E131C] p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4F8CFF] bg-[#4F8CFF]/10 px-2.5 py-1 rounded-lg border border-[#4F8CFF]/20">
                  1. Launch Overview
                </span>
                <span className="text-xs font-mono text-[#46E3A3]">T-Minus Launch Active</span>
              </div>
              <div>
                <h4 className="text-xs font-mono text-[#A8B3C7]">Launch Target Goal</h4>
                <p className="text-sm font-semibold text-[#F5F8FC] mt-1">{launchGoalInput}</p>
              </div>
            </div>

            {/* Component 2: Countdown Timer Display */}
            <div className="rounded-2xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 p-6 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#46E3A3] flex items-center gap-1.5">
                  <Clock className="size-4" /> 2. Countdown Timer
                </span>
                <span className="text-xs font-mono text-[#E1F4FF]">{launchDateInput}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center py-2 font-mono">
                <div className="bg-[#0E131C]/80 p-2 rounded-xl border border-white/10">
                  <span className="text-xl font-extrabold text-[#46E3A3]">07</span>
                  <span className="block text-[9px] text-[#A8B3C7]">DAYS</span>
                </div>
                <div className="bg-[#0E131C]/80 p-2 rounded-xl border border-white/10">
                  <span className="text-xl font-extrabold text-[#64D8FF]">14</span>
                  <span className="block text-[9px] text-[#A8B3C7]">HOURS</span>
                </div>
                <div className="bg-[#0E131C]/80 p-2 rounded-xl border border-white/10">
                  <span className="text-xl font-extrabold text-[#4F8CFF]">32</span>
                  <span className="block text-[9px] text-[#A8B3C7]">MINS</span>
                </div>
                <div className="bg-[#0E131C]/80 p-2 rounded-xl border border-white/10">
                  <span className="text-xl font-extrabold text-[#F5F8FC]">45</span>
                  <span className="block text-[9px] text-[#A8B3C7]">SECS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Component 3: Pre-launch Checklist */}
          <Panel
            title="3. Pre-Launch Sprint Checklist"
            action={
              <div className="w-48">
                <Progress value={progressPct} label="Sprint Progress" />
              </div>
            }
          >
            <div className="space-y-4">
              {sprintPlan.preLaunch?.map((pl, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#64D8FF] text-sm">{pl.day}: {pl.objective}</span>
                    <span className="font-mono text-[10px] text-[#A8B3C7] bg-white/5 px-2 py-0.5 rounded">Owner: {pl.owner}</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {pl.tasks?.map((t, ti) => {
                      const taskId = `pre-${idx}-${ti}`;
                      const isDone = Boolean(completedPreTasks[taskId]);
                      return (
                        <div key={ti} className="flex items-center gap-2.5 text-[#F5F8FC]">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => togglePreTask(taskId)}
                            className="size-4 accent-[#46E3A3] cursor-pointer"
                          />
                          <span className={isDone ? "line-through text-[#A8B3C7]" : ""}>{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Component 4: Launch Day Timeline */}
          <Panel title="4. Launch Day Hour-by-Hour Timeline">
            <div className="relative space-y-3 border-l border-white/10 pl-4">
              {sprintPlan.launchDay?.map((ld, idx) => (
                <div key={idx} className="relative flex items-center justify-between rounded-xl border border-white/10 bg-[#141C28] p-3 text-xs">
                  <span className="absolute -left-[21px] size-2 rounded-full bg-[#64D8FF]" />
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#64D8FF] shrink-0">{ld.time}</span>
                    <span className="font-semibold text-[#F5F8FC]">{ld.activity}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#A8B3C7] shrink-0">Resp: {ld.responsibility}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Component 5 & 6: Content Calendar & User Acquisition Board */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 5: Content Calendar */}
            <Panel title="5. Content Publishing Schedule">
              <div className="space-y-2 text-xs">
                {sprintPlan.contentSchedule?.map((cs, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#64D8FF]">{cs.platform}</span>
                      <span className="font-mono text-[10px] text-[#46E3A3]">{cs.date}</span>
                    </div>
                    <p className="text-[#A8B3C7] text-[11px]">{cs.content}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Component 6: User Acquisition Board */}
            <Panel title="6. User Acquisition & Community Plan">
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <span className="font-mono font-bold text-[#46E3A3] text-[10px] uppercase">User Acquisition Plan</span>
                  {sprintPlan.userAcquisitionPlan?.map((ap, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#141C28] p-2.5 text-[#F5F8FC]">
                      <Users className="size-3.5 text-[#46E3A3] shrink-0" />
                      <span>{ap}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="font-mono font-bold text-[#64D8FF] text-[10px] uppercase">Community Building Strategy</span>
                  {sprintPlan.communityStrategy?.map((cs, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#141C28] p-2.5 text-[#A8B3C7]">
                      <ArrowRight className="size-3.5 text-[#64D8FF] shrink-0" />
                      <span>{cs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* Component 7 & 8: Metrics Dashboard & Risk Management Panel */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 7: Metrics Dashboard */}
            <Panel title="7. Launch Target Metrics Dashboard">
              <div className="grid gap-3 sm:grid-cols-2">
                {sprintPlan.launchMetrics?.map((m, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-1">
                    <span className="text-[#A8B3C7] block">{m.metric}</span>
                    <span className="text-xl font-extrabold font-display text-[#46E3A3]">{m.target}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Component 8: Risk Management Panel */}
            <Panel title="8. Risk Management & Mitigations">
              <div className="space-y-2 text-xs">
                {sprintPlan.riskManagement?.map((rm, idx) => (
                  <div key={idx} className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 space-y-1">
                    <span className="font-bold text-red-300 flex items-center gap-1.5">
                      <ShieldAlert className="size-3.5 text-red-400" />
                      Risk: {rm.risk}
                    </span>
                    <p className="text-emerald-300 text-[11px]"><strong>Mitigation: </strong>{rm.solution}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
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