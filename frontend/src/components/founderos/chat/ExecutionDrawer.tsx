import React, { useState, useEffect } from "react";
import { X, Kanban, Calendar, Flag, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Layers } from "lucide-react";
import api from "@/lib/api";
import { useActiveVenture } from "@/lib/founderos/store";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category: "Validation" | "Product" | "Launch" | "Growth" | "Fundraising";
  status: "To Do" | "In Progress" | "Review" | "Done";
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedEffort: "Small" | "Medium" | "Large";
  dueDate?: string;
  completedAt?: string;
}

export interface Milestone {
  _id: string;
  title: string;
  category: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  progressPercentage: number;
  targetDate?: string;
}

export interface Sprint {
  _id: string;
  weekNumber: number;
  weeklyGoal: string;
  startDate: string;
  endDate: string;
  taskIds?: Task[];
}

export interface WeeklyReviewData {
  _id?: string;
  weekNumber: number;
  completedSummary: string;
  outstandingRisks: string[];
  nextPriorities: string[];
  pillarProgress: {
    validation: number;
    product: number;
    launch: number;
    growth: number;
    fundraising: number;
  };
}

interface ExecutionDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ExecutionDrawer: React.FC<ExecutionDrawerProps> = ({ open, onClose }) => {
  const { venture } = useActiveVenture();
  const [activeTab, setActiveTab] = useState<"kanban" | "sprint" | "milestones" | "review">("kanban");

  const [kanban, setKanban] = useState<Record<string, Task[]>>({
    "To Do": [],
    "In Progress": [],
    "Review": [],
    "Done": [],
  });
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [pillars, setPillars] = useState<Record<string, number>>({
    validation: 0,
    product: 0,
    launch: 0,
    growth: 0,
    fundraising: 0,
  });
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewData | null>(null);

  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (open && venture?.id) {
      fetchExecutionData();
    }
  }, [open, venture?.id]);

  async function fetchExecutionData() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const [kanbanRes, sprintRes, milestonesRes, progressRes, reviewRes] = await Promise.all([
        api.getKanbanTasks(venture.id),
        api.getSprint(venture.id),
        api.getMilestones(venture.id),
        api.getPillarProgress(venture.id),
        api.getWeeklyReview(venture.id),
      ]);

      if (kanbanRes.success && kanbanRes.data?.tasks) setKanban(kanbanRes.data.tasks);
      if (sprintRes.success && sprintRes.data?.sprint) setSprint(sprintRes.data.sprint);
      if (milestonesRes.success && milestonesRes.data?.milestones) setMilestones(milestonesRes.data.milestones);
      if (progressRes.success && progressRes.data?.progress) setPillars(progressRes.data.progress);
      if (reviewRes.success && reviewRes.data?.review) setWeeklyReview(reviewRes.data.review);
    } catch (err) {
      console.warn("Failed to fetch execution data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    setUpdatingTaskId(taskId);
    try {
      const res = await api.updateTaskStatus(taskId, newStatus);
      if (res.success && venture?.id) {
        await fetchExecutionData();
      }
    } catch (err) {
      console.warn("Failed to update task status:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="flex h-full w-full max-w-5xl flex-col border-l border-white/10 bg-[#0E131C] text-[#F5F8FC] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#141C28]/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#46E3A3]/20 to-[#64D8FF]/10 border border-[#46E3A3]/30 text-[#46E3A3]">
              <Kanban className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold font-display text-[#F5F8FC] flex items-center gap-2">
                AI Execution Operating System
                <Sparkles className="size-4 text-[#46E3A3]" />
              </h2>
              <p className="text-xs text-[#A8B3C7]">
                Turn AI insights into 7-day sprints, Kanban tasks, and 5-pillar milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void fetchExecutionData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161F2D] px-3 py-1.5 text-xs font-medium text-[#A8B3C7] transition hover:border-[#46E3A3]/40 hover:text-[#F5F8FC]"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#46E3A3]" : ""}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#A8B3C7] transition hover:bg-white/5 hover:text-[#F5F8FC]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0A0D14] px-6 gap-2 pt-2">
          {[
            { id: "kanban", label: "Kanban Board", icon: Kanban },
            { id: "sprint", label: "7-Day Sprint", icon: Calendar },
            { id: "milestones", label: "5 Pillars & Milestones", icon: Layers },
            { id: "review", label: "Weekly Executive Review", icon: Flag },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition ${
                  active
                    ? "bg-[#080A0F] text-[#46E3A3] border-white/10 border-b-[#080A0F] shadow-sm"
                    : "text-[#A8B3C7] border-transparent hover:text-[#F5F8FC] hover:bg-white/5"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#080A0F]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#A8B3C7]">
              <RefreshCw className="size-6 animate-spin text-[#46E3A3]" />
              <p className="text-xs font-mono">Syncing Execution Engine…</p>
            </div>
          ) : (
            <>
              {/* TAB 1: KANBAN BOARD */}
              {activeTab === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {["To Do", "In Progress", "Review", "Done"].map((column) => {
                    const tasksInCol = kanban[column] || [];
                    return (
                      <div key={column} className="flex flex-col rounded-2xl border border-white/10 bg-[#0E131C] p-3 space-y-3">
                        <div className="flex items-center justify-between px-2 py-1 border-b border-white/5">
                          <span className="text-xs font-bold font-mono text-[#F5F8FC]">{column}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-[#A8B3C7]">
                            {tasksInCol.length}
                          </span>
                        </div>

                        <div className="space-y-2.5 min-h-[300px]">
                          {tasksInCol.length === 0 ? (
                            <p className="text-[11px] text-[#A8B3C7] italic text-center py-6">No tasks</p>
                          ) : (
                            tasksInCol.map((task) => (
                              <div
                                key={task._id}
                                className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-[#141C28] p-3 shadow-md transition hover:border-[#46E3A3]/40"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-[#F5F8FC] leading-snug">{task.title}</h4>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                      task.priority === "HIGH"
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>

                                {task.description ? (
                                  <p className="text-[11px] text-[#A8B3C7] line-clamp-2">{task.description}</p>
                                ) : null}

                                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-[#A8B3C7]">
                                  <span>{task.category}</span>

                                  {/* Quick Column Shift Selector */}
                                  <select
                                    disabled={updatingTaskId === task._id}
                                    value={task.status}
                                    onChange={(e) => void handleStatusChange(task._id, e.target.value)}
                                    className="bg-[#0E131C] text-[10px] text-[#46E3A3] font-mono rounded px-1.5 py-0.5 border border-white/10 outline-none cursor-pointer"
                                  >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                  </select>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: 7-DAY SPRINT */}
              {activeTab === "sprint" && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full border border-[#46E3A3]/30 bg-[#46E3A3]/10 text-xs font-mono font-bold text-[#46E3A3]">
                          Active Sprint • Week {sprint?.weekNumber || 1}
                        </span>
                        <h3 className="text-lg font-bold text-[#F5F8FC] mt-2">
                          Goal: {sprint?.weeklyGoal || "Validate core customer problem"}
                        </h3>
                      </div>
                      <div className="text-right text-xs font-mono text-[#A8B3C7]">
                        <p>Start: {new Date(sprint?.startDate || Date.now()).toLocaleDateString()}</p>
                        <p>End: {new Date(sprint?.endDate || Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <h4 className="text-xs font-mono font-bold text-[#A8B3C7] uppercase tracking-wider">
                      Sprint Commitments & Tasks ({sprint?.taskIds?.length || 0})
                    </h4>

                    <div className="space-y-2">
                      {sprint?.taskIds && sprint.taskIds.length > 0 ? (
                        sprint.taskIds.map((t) => (
                          <div key={t._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141C28] p-3 text-xs">
                            <span className="font-semibold text-[#F5F8FC]">{t.title}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[11px] text-[#64D8FF]">Effort: {t.estimatedEffort || "Medium"}</span>
                              <span className="font-mono text-[11px] text-[#46E3A3]">{t.status}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#A8B3C7] italic">No specific tasks linked to active sprint.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 5 PILLARS & MILESTONES */}
              {activeTab === "milestones" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* 5 Pillar Progress Bars */}
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#46E3A3] uppercase tracking-wider">
                      5 Startup Execution Pillars
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      {[
                        { key: "validation", label: "1. Validation", val: pillars.validation },
                        { key: "product", label: "2. Product", val: pillars.product },
                        { key: "launch", label: "3. Launch", val: pillars.launch },
                        { key: "growth", label: "4. Growth", val: pillars.growth },
                        { key: "fundraising", label: "5. Fundraising", val: pillars.fundraising },
                      ].map((p) => (
                        <div key={p.key} className="rounded-xl border border-white/10 bg-[#141C28] p-3 space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{p.label}</span>
                            <span className="font-mono text-[#46E3A3]">{p.val}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#4F8CFF] to-[#46E3A3] transition-all duration-500"
                              style={{ width: `${p.val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Startup Phase Milestones */}
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#F5F8FC] uppercase tracking-wider">
                      Startup Roadmap Milestones ({milestones.length})
                    </h3>

                    <div className="space-y-3">
                      {milestones.map((m) => (
                        <div key={m._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141C28] p-4">
                          <div>
                            <h4 className="text-xs font-bold text-[#F5F8FC]">{m.title}</h4>
                            <p className="text-[11px] text-[#A8B3C7] mt-0.5">Category: {m.category}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-bold text-[#46E3A3]">{m.progressPercentage}% Complete</span>
                            <span className="px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] font-mono text-[#A8B3C7]">
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WEEKLY REVIEW */}
              {activeTab === "review" && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full border border-[#64D8FF]/30 bg-[#64D8FF]/10 text-xs font-mono font-bold text-[#64D8FF]">
                          Executive Weekly Review • Week {weeklyReview?.weekNumber || 1}
                        </span>
                        <h3 className="text-base font-bold text-[#F5F8FC] mt-2">Executive Progress & Action Directive</h3>
                      </div>
                    </div>

                    {/* Completed Work Summary */}
                    <div className="rounded-xl border border-white/10 bg-[#141C28] p-4 space-y-2">
                      <h4 className="text-xs font-bold text-[#46E3A3] flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-[#46E3A3]" /> Completed Achievements
                      </h4>
                      <p className="text-xs text-[#E1F4FF] leading-relaxed">
                        {weeklyReview?.completedSummary || "No work summarized yet."}
                      </p>
                    </div>

                    {/* Outstanding Risks */}
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="size-4 text-red-400" /> Outstanding Risks
                      </h4>
                      <ul className="space-y-1 text-xs text-red-200">
                        {weeklyReview?.outstandingRisks && weeklyReview.outstandingRisks.length > 0 ? (
                          weeklyReview.outstandingRisks.map((r, idx) => <li key={idx}>• {r}</li>)
                        ) : (
                          <li>• None flagged</li>
                        )}
                      </ul>
                    </div>

                    {/* Next Priorities */}
                    <div className="rounded-xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-[#64D8FF] flex items-center gap-2">
                        <ArrowRight className="size-4 text-[#64D8FF]" /> Top Next Priorities
                      </h4>
                      <ul className="space-y-1 text-xs text-[#E1F4FF]">
                        {weeklyReview?.nextPriorities && weeklyReview.nextPriorities.length > 0 ? (
                          weeklyReview.nextPriorities.map((p, idx) => <li key={idx}>• {p}</li>)
                        ) : (
                          <li>• None defined</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
