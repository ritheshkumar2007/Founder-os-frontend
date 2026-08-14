import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, CopyButton, Empty, Field, LinkButton, PageHeader, Panel, Progress, Stat, TextArea, TextInput } from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Clock, CheckCircle2, Calendar, Target, ShieldAlert, Rocket, History, Users, ArrowRight, AlertTriangle, AlertCircle, Check, Plus, Layers, ArrowUpRight, Route as RouteIcon, Zap, Activity } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { SprintMissionAnalysisModal } from "@/components/founderos/sprint/SprintMissionAnalysisModal";
import api from "@/lib/api";
import { toast } from "sonner";

const TITLE = "7-Day Sprint Flight Deck — FounderOS";
const DESCRIPTION = "High-velocity tactical deployment framework. Execute tasks within strict parameters to compound momentum.";

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
  component: SprintFlightDeckPage,
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

interface DirectiveItem {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
}

interface RoadmapPhase {
  id: string;
  dayRange: string;
  title: string;
  description: string;
  minDay: number;
  maxDay: number;
  tasks: { id: string; code: string; label: string; done: boolean }[];
}

const DEFAULT_DIRECTIVES: DirectiveItem[] = [
  {
    id: "dir-1",
    title: "Deploy V2 Authentication",
    subtitle: "Zero-trust architecture integration",
    done: true,
  },
  {
    id: "dir-2",
    title: "Refactor Data Pipeline",
    subtitle: "Decrease latency by 40%",
    done: false,
  },
  {
    id: "dir-3",
    title: "Client Onboarding Flow",
    subtitle: "Pending design system update",
    done: false,
  },
];

const DEFAULT_PHASES: RoadmapPhase[] = [
  {
    id: "phase-1",
    dayRange: "Day 1-2",
    title: "Foundation & Intel",
    description: "System architecture review and environment provisioning. Database schemas locked.",
    minDay: 1,
    maxDay: 2,
    tasks: [
      { id: "t1-1", code: "Task 1.1", label: "Architecture Spec & API Boundaries", done: true },
      { id: "t1-2", code: "Task 1.2", label: "Database Schema & Migration Scripts", done: true },
    ],
  },
  {
    id: "phase-2",
    dayRange: "Day 3",
    title: "Core API Infrastructure",
    description: "RESTful endpoint generation, rate limiting, and zero-trust auth middleware wiring.",
    minDay: 3,
    maxDay: 3,
    tasks: [
      { id: "t3-1", code: "Task 3.1", label: "RESTful Endpoint Generation", done: true },
      { id: "t3-2", code: "Task 3.2", label: "Middleware Auth Wiring", done: false },
    ],
  },
  {
    id: "phase-3",
    dayRange: "Day 4-5",
    title: "Front-End Integration",
    description: "Connecting UI components to staging environment. Real-time state management implementation.",
    minDay: 4,
    maxDay: 5,
    tasks: [
      { id: "t4-1", code: "Task 4.1", label: "Staging Environment Component Wiring", done: false },
      { id: "t4-2", code: "Task 4.2", label: "Optimistic State Sync & Error Handling", done: false },
    ],
  },
  {
    id: "phase-4",
    dayRange: "Day 6-7",
    title: "QA & Deployment",
    description: "Load testing, security audit, and production push sequence.",
    minDay: 6,
    maxDay: 7,
    tasks: [
      { id: "t6-1", code: "Task 6.1", label: "P99 Latency & End-to-End Test Suite", done: false },
      { id: "t6-2", code: "Task 6.2", label: "Production DNS & Traffic Cutover", done: false },
    ],
  },
];

function SprintFlightDeckPage() {
  const { venture, update } = useActiveVenture();

  // Active Flight Deck State
  const [activeDay, setActiveDay] = useState<number>(3);
  const [directives, setDirectives] = useState<DirectiveItem[]>(DEFAULT_DIRECTIVES);
  const [phases, setPhases] = useState<RoadmapPhase[]>(DEFAULT_PHASES);
  const [newDirectiveText, setNewDirectiveText] = useState("");
  const [isAddingDirective, setIsAddingDirective] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"flight-deck" | "launch-matrix">("flight-deck");

  // Detailed AI Launch Plan State (from legacy generator)
  const [generating, setGenerating] = useState(false);
  const [sprintPlan, setSprintPlan] = useState<SprintPlanData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [ideaInput, setIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [marketingPlanInput, setMarketingPlanInput] = useState("");
  const [launchDateInput, setLaunchDateInput] = useState("");
  const [launchGoalInput, setLaunchGoalInput] = useState("");

  const ventureId = venture?.id || (venture as any)?._id || "default-venture";

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setIdeaInput(venture.brief?.building || "");
      setMvpScopeInput(venture.mvpScope?.mustHaveFeatures?.join(", ") || venture.mvp?.job || "");
      setMarketingPlanInput(venture.marketingPlan?.brandPositioning || "");
    }
  }, [venture]);

  // Dynamic Velocity Calculation
  const totalDirectives = directives.length;
  const completedDirectives = directives.filter((d) => d.done).length;
  const totalRoadmapTasks = phases.flatMap((p) => p.tasks).length;
  const completedRoadmapTasks = phases.flatMap((p) => p.tasks).filter((t) => t.done).length;

  const totalItems = totalDirectives + totalRoadmapTasks;
  const totalDone = completedDirectives + completedRoadmapTasks;
  const velocityScore = totalItems > 0 ? Math.round((totalDone / totalItems) * 50 + 50) : 84;

  const handleToggleDirective = (id: string) => {
    setDirectives((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextDone = !d.done;
          if (nextDone) {
            toast.success(`Directive completed: "${d.title}"`);
          }
          return { ...d, done: nextDone };
        }
        return d;
      })
    );
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveText.trim()) return;
    const newDir: DirectiveItem = {
      id: `dir-${Date.now()}`,
      title: newDirectiveText.trim(),
      subtitle: "Sprint target",
      done: false,
    };
    setDirectives((prev) => [...prev, newDir]);
    setNewDirectiveText("");
    setIsAddingDirective(false);
    toast.success(`New directive added to Day ${activeDay} sprint`);
  };

  const handleToggleRoadmapTask = (phaseId: string, taskId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          return {
            ...p,
            tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
          };
        }
        return p;
      })
    );
  };

  async function handleGenerateDetailedPlan() {
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
        setSprintPlan(res.data.launchSprint.sprintPlan || res.data.launchSprint);
        toast.success("Detailed launch plan generated successfully.");
      }
    } catch (err) {
      console.warn("Failed to generate launch plan:", err);
      toast.error("Failed to generate detailed plan.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[rgba(139,92,246,0.3)] pb-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] w-fit">
            <div className="size-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(167,139,250,0.8)] animate-pulse" />
            <span className="font-mono text-xs font-semibold text-[#d0bcff]">
              SPRINT ACTIVE // DAY {activeDay} OF 7
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight mt-1">
            Time-Boxed Execution
          </h1>
          <p className="text-base text-[#cbc3d7] max-w-2xl leading-relaxed">
            High-velocity tactical deployment framework. Execute tasks within strict parameters to compound momentum.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#181c1f] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("flight-deck")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                viewMode === "flight-deck"
                  ? "bg-[#A78BFA] text-black font-bold shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                  : "text-[#cbc3d7] hover:text-white"
              }`}
            >
              Flight Deck
            </button>
            <button
              onClick={() => setViewMode("launch-matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                viewMode === "launch-matrix"
                  ? "bg-[#A78BFA] text-black font-bold shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                  : "text-[#cbc3d7] hover:text-white"
              }`}
            >
              Full Plan Matrix
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setAnalysisModalOpen(true)}
            className="shrink-0 bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-bold text-sm px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            <span>Run Mission Analysis</span>
          </button>
        </div>
      </section>

      {/* Day Progress Switcher Pill Row */}
      <div className="flex items-center justify-between bg-[#101417]/80 p-3 rounded-2xl border border-[rgba(139,92,246,0.25)] overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-[#958ea0] uppercase mr-2 hidden sm:inline">Active Sprint Day:</span>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const isCurrent = activeDay === d;
            const isPast = d < activeDay;
            return (
              <button
                key={d}
                onClick={() => {
                  setActiveDay(d);
                  toast.info(`Switched active flight focus to Day ${d}`);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? "bg-[#A78BFA] text-black font-bold shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                    : isPast
                    ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]"
                    : "bg-[#181c1f] text-[#cbc3d7] hover:bg-white/5 border border-white/5"
                }`}
              >
                {isPast && <Check className="size-3" />}
                <span>Day {d}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-[#A78BFA] shrink-0 bg-[#181c1f] px-3 py-1 rounded-lg border border-[rgba(139,92,246,0.3)]">
          T-MINUS {Math.max(0, 7 - activeDay)} DAYS
        </span>
      </div>

      {viewMode === "flight-deck" ? (
        /* Main Flight Deck Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metrics & Stats (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Velocity Card */}
            <div className="glass-card rounded-xl p-6 relative overflow-hidden group border border-[rgba(139,92,246,0.3)]">
              <div className="absolute -right-4 -top-4 size-24 bg-[rgba(139,92,246,0.1)] rounded-full blur-2xl group-hover:bg-[rgba(139,92,246,0.2)] transition-all duration-500" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="font-mono text-xs text-[#cbc3d7] uppercase tracking-wider">
                  Current Velocity
                </h3>
                <span className="material-symbols-outlined text-[#A78BFA]">speed</span>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-5xl font-bold font-display text-white">
                  {velocityScore}
                </span>
                <span className="text-sm font-semibold text-[#A78BFA] flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  +12%
                </span>
              </div>
              <div className="w-full bg-[#1c2023] rounded-full h-2 mt-6 overflow-hidden border border-[rgba(139,92,246,0.2)] relative z-10">
                <div
                  className="bg-[#A78BFA] h-full rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-500 ease-out"
                  style={{ width: `${velocityScore}%` }}
                />
              </div>
            </div>

            {/* Core Objectives Bento / Sprint Directives */}
            <div className="glass-card rounded-xl p-6 flex-1 flex flex-col border border-[rgba(139,92,246,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-xs text-[#cbc3d7] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#A78BFA]">target</span>
                  Sprint Directives
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181c1f] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                  {completedDirectives}/{totalDirectives} DONE
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {directives.map((dir) => {
                  return (
                    <div
                      key={dir.id}
                      onClick={() => handleToggleDirective(dir.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        dir.done
                          ? "bg-[rgba(139,92,246,0.08)] border-[#A78BFA]/50"
                          : "bg-[#181c1f]/60 border-[rgba(139,92,246,0.2)] hover:border-[rgba(139,92,246,0.5)] hover:bg-[#181c1f]"
                      }`}
                    >
                      <div
                        className={`size-5 mt-0.5 rounded flex items-center justify-center transition-all ${
                          dir.done
                            ? "bg-[#A78BFA] border border-[#A78BFA] text-black shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                            : "border border-[#958ea0] bg-transparent hover:border-[#A78BFA]"
                        }`}
                      >
                        {dir.done && <Check className="size-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-medium ${
                            dir.done ? "text-white line-through text-[#cbc3d7]" : "text-[#e0e3e7]"
                          }`}
                        >
                          {dir.title}
                        </h4>
                        <p className="text-xs text-[#958ea0] mt-0.5 truncate">
                          {dir.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Add Directive Inline Form */}
                {isAddingDirective ? (
                  <form onSubmit={handleAddDirective} className="mt-2 space-y-2">
                    <input
                      type="text"
                      autoFocus
                      value={newDirectiveText}
                      onChange={(e) => setNewDirectiveText(e.target.value)}
                      placeholder="Enter directive title..."
                      className="w-full bg-[#020408] border border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#74839A] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setIsAddingDirective(false)}
                        className="px-2.5 py-1 text-[#958ea0] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#A78BFA] text-black font-bold rounded-lg hover:bg-[#bfa8ff]"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingDirective(true)}
                    className="mt-2 w-full py-2.5 rounded-xl border border-dashed border-[rgba(139,92,246,0.3)] hover:border-[#A78BFA] text-[#cbc3d7] hover:text-[#A78BFA] font-mono text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Sprint Directive</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 7-Day Roadmap (8 cols) */}
          <div className="lg:col-span-8 glass-card rounded-xl p-6 md:p-8 border border-[rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-[#A78BFA]">route</span>
                Tactical Roadmap
              </h2>
              <span className="font-mono text-xs text-[#cbc3d7] bg-[#181c1f] px-3 py-1 rounded-md border border-[rgba(139,92,246,0.3)]">
                T-MINUS {Math.max(0, 7 - activeDay)} DAYS
              </span>
            </div>

            {/* Tactical Timeline with vertical connector */}
            <div className="relative sprint-timeline pl-10 md:pl-12 py-2 flex flex-col gap-8">
              {phases.map((phase) => {
                const isCompleted = activeDay > phase.maxDay;
                const isActive = activeDay >= phase.minDay && activeDay <= phase.maxDay;
                const isLocked = activeDay < phase.minDay;

                return (
                  <div key={phase.id} className="relative z-10 group">
                    {/* Node Dot Icon */}
                    {isCompleted ? (
                      <div className="absolute -left-10 md:-left-12 size-6 rounded-full bg-[#020408] border-2 border-[#A78BFA] flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        <Check className="size-3 text-[#A78BFA] stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <div className="absolute -left-10 md:-left-12 size-6 rounded-full bg-[#020408] border-2 border-[#A78BFA] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-pulse">
                        <div className="size-2 bg-[#A78BFA] rounded-full" />
                      </div>
                    ) : (
                      <div className="absolute -left-[35px] md:-left-[43px] size-4 rounded-full bg-[#020408] border-2 border-[#958ea0] flex items-center justify-center mt-1" />
                    )}

                    {/* Phase Content Box */}
                    {isActive ? (
                      <div className="bg-[#0b0f12] border border-[#A78BFA] rounded-xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-32 bg-[rgba(139,92,246,0.06)] blur-3xl rounded-full pointer-events-none" />

                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2 relative z-10">
                          <h3 className="text-lg font-bold font-display text-white text-glow">
                            {phase.dayRange}: {phase.title}
                          </h3>
                          <span className="font-mono text-xs text-[#d0bcff] bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] px-2.5 py-0.5 rounded flex items-center gap-1.5 w-fit">
                            <span className="material-symbols-outlined text-[14px]">sync</span>
                            IN PROGRESS
                          </span>
                        </div>

                        <p className="text-xs text-[#cbc3d7] mb-4 leading-relaxed relative z-10">
                          {phase.description}
                        </p>

                        {/* Interactive Task Sub-Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 mt-2">
                          {phase.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleToggleRoadmapTask(phase.id, task.id)}
                              className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                                task.done
                                  ? "bg-[#000000] border-[#A78BFA]/50 text-white shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                                  : "bg-[#000000] border-[rgba(139,92,246,0.3)] hover:border-[#A78BFA] focus-within:shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] text-[#A78BFA] font-bold uppercase">
                                  {task.code}
                                </span>
                                {task.done && (
                                  <span className="text-[10px] font-mono text-[#A78BFA] flex items-center gap-1">
                                    <Check className="size-3" /> Done
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs font-medium ${task.done ? "line-through text-[#cbc3d7]" : "text-white"}`}>
                                {task.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`border rounded-xl p-5 transition-all duration-300 ${
                          isCompleted
                            ? "bg-[#0a0c10] border-[rgba(139,92,246,0.3)] opacity-80 hover:opacity-100"
                            : "bg-[#0a0c10] border-[rgba(139,92,246,0.2)] hover:border-[rgba(139,92,246,0.5)]"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                          <h3
                            className={`text-base font-medium ${
                              isCompleted
                                ? "text-white line-through decoration-[#958ea0]"
                                : "text-[#e0e3e7]"
                            }`}
                          >
                            {phase.dayRange}: {phase.title}
                          </h3>
                          <span
                            className={`font-mono text-[11px] px-2.5 py-0.5 rounded w-fit ${
                              isCompleted
                                ? "text-[#A78BFA] bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] font-bold"
                                : "text-[#958ea0] bg-[#181c1f] border border-white/5"
                            }`}
                          >
                            {isCompleted ? "COMPLETED" : "QUEUED"}
                          </span>
                        </div>
                        <p className="text-xs text-[#cbc3d7] leading-relaxed">
                          {phase.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Full Launch Plan Matrix (Detailed AI Planning View) */
        <div className="space-y-6 animate-fade-in">
          <Panel title="AI Launch Parameters & Inputs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Venture Name">
                <TextInput
                  value={ventureNameInput}
                  onChange={(e) => setVentureNameInput(e.target.value)}
                  placeholder="e.g. Acme SaaS"
                />
              </Field>
              <Field label="Target Launch Date">
                <TextInput
                  value={launchDateInput}
                  onChange={(e) => setLaunchDateInput(e.target.value)}
                  placeholder="e.g. 2026-09-15"
                />
              </Field>
              <Field label="Launch Target / Goal">
                <TextInput
                  value={launchGoalInput}
                  onChange={(e) => setLaunchGoalInput(e.target.value)}
                  placeholder="e.g. Acquire 20–50 test users"
                />
              </Field>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleGenerateDetailedPlan}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA] text-black font-bold px-5 py-2.5 text-xs hover:bg-[#bfa8ff] transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                {generating ? "AI Is Planning Sprint..." : "Generate Full Matrix"}
              </button>
            </div>
          </Panel>

          {sprintPlan && (
            <div className="space-y-6">
              {/* Pre-Launch Tasks */}
              <Panel title="Pre-Launch Sprint Tasks">
                <div className="space-y-3">
                  {sprintPlan.preLaunch?.map((item, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-bold text-[#A78BFA] font-mono text-sm">{item.day}</span>
                        <span className="text-[10px] font-mono text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2 py-0.5 rounded-md border border-[rgba(139,92,246,0.3)]">
                          Owner: {item.owner}
                        </span>
                      </div>
                      <ul className="space-y-1 text-white">
                        {item.tasks?.map((t, ti) => (
                          <li key={ti} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-[#A78BFA] shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Launch Day Priorities */}
              <Panel title="Launch Day Priorities">
                <div className="grid gap-3 sm:grid-cols-2">
                  {sprintPlan.launchDay?.map((item, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-1.5">
                      <span className="font-mono text-[10px] font-bold text-[#A78BFA] uppercase">{item.time}</span>
                      <p className="font-semibold text-[#F5F8FC]">{item.activity}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[rgba(139,92,246,0.25)]">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              update((v) => ({ ...v }));
              toast.success("7-Day Sprint Flight Deck state saved.");
            }}
          >
            Save Sprint Flight Deck
          </Button>
        </div>

        <LinkButton to="/workspace/traction" variant="primary">
          <span>Continue to Traction Engine</span>
          <ArrowRight className="size-4 ml-1" />
        </LinkButton>
      </div>

      {/* Mission Analysis Modal */}
      <SprintMissionAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        ventureName={venture?.name || "Active Venture"}
        velocityScore={velocityScore}
        activeDay={activeDay}
        completedDirectivesCount={completedDirectives}
        totalDirectivesCount={totalDirectives}
      />
    </div>
  );
}