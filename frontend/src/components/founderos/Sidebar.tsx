import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut, Plus, Settings, X, Shield, Rocket, Layers, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { addVenture, setActiveVenture, signOut, useActiveVenture } from "@/lib/founderos/store";
import { Button } from "@/components/founderos/ui";
import { checkRouteAccess, getFounderJourney } from "@/lib/founderos/journey";
import { toast } from "sonner";

export interface NavSection {
  category: string;
  items: { to: string; label: string }[];
}

export const STAGED_NAV: NavSection[] = [
  {
    category: "Idea Validation",
    items: [
      { to: "/workspace/idea-validation", label: "Idea Validation" },
    ],
  },
  {
    category: "Build",
    items: [
      { to: "/workspace/mvp-scope", label: "MVP Scope" },
      { to: "/workspace/build-roadmap", label: "Build Roadmap" },
    ],
  },
  {
    category: "Go To Market",
    items: [
      { to: "/workspace/marketing-plan", label: "Marketing Plan" },
    ],
  },
  {
    category: "Growth",
    items: [
      { to: "/workspace/launch-sprint", label: "Launch Sprint" },
      { to: "/workspace/traction", label: "Traction" },
      { to: "/workspace/investor-update", label: "Investor Update" },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { app, venture } = useActiveVenture();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openSelector, setOpenSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const journey = getFounderJourney(venture);

  const handleCreateVenture = () => {
    const name = window.prompt("Name your new venture", "Untitled Venture");
    if (name === null) return;
    const newId = addVenture(name.trim() || "Untitled Venture");
    setActiveVenture(newId);
    navigate({ to: "/workspace/idea-validation" as any });
    onNavigate?.();
  };

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col gap-5 bg-[#0b0f12] p-5 relative select-none border-r border-[rgba(139,92,246,0.2)]">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 group">
        <span className="grid size-9 place-items-center rounded-xl border border-[#A78BFA]/40 bg-[#A78BFA]/15 font-display text-[#A78BFA] text-base font-bold shadow-[0_0_15px_rgba(167,139,250,0.3)]">
          <Rocket className="size-4 text-[#A78BFA]" />
        </span>
        <div className="flex flex-col">
          <span className="font-display text-base font-bold text-white tracking-tight">
            Founder<span className="text-[#A78BFA]">OS</span>
          </span>
          <span className="text-[10px] font-mono text-[#958ea0] uppercase tracking-widest -mt-0.5">
            Startup Workspace
          </span>
        </div>
      </Link>

      {/* New Venture CTA */}
      <button
        type="button"
        onClick={handleCreateVenture}
        className="btn-system inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_0_20px_rgba(167,139,250,0.25)] transition hover:brightness-110 active:scale-[0.98] cursor-pointer text-white"
      >
        <Plus className="size-4" /> New Venture
      </button>

      {/* Venture Selector Dropdown */}
      <div className="relative">
        <label className="text-[10px] uppercase tracking-wider font-mono text-[#958ea0] mb-1.5 block px-1">
          Active Venture
        </label>
        <button
          type="button"
          onClick={() => setOpenSelector((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#101417] px-3.5 py-2.5 text-left text-sm font-medium text-white transition hover:bg-white/5 hover:border-[#A78BFA]/40"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="size-3.5 text-[#A78BFA] shrink-0" />
            <span className="truncate">{venture?.name ?? "Select Venture"}</span>
          </div>
          <ChevronDown className={cn("size-4 text-[#958ea0] transition-transform duration-200", openSelector && "rotate-180")} />
        </button>

        {openSelector ? (
          <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] p-1 shadow-[0_20px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {app.ventures.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVenture(v.id);
                    setOpenSelector(false);
                    onNavigate?.();
                  }}
                  className={cn(
                    "w-full truncate rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/5 flex items-center justify-between",
                    v.id === venture?.id ? "text-[#A78BFA] font-semibold bg-[#A78BFA]/10" : "text-white",
                  )}
                >
                  <span className="truncate">{v.name}</span>
                  {v.id === venture?.id ? <span className="size-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA] shrink-0" /> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Stage Categorized Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {STAGED_NAV.map((section) => (
          <div key={section.category} className="space-y-1">
            <p className="px-2 text-[10px] uppercase font-mono tracking-widest text-[#958ea0]">
              {section.category}
            </p>
            {section.items.map((item) => {
              const active =
                pathname === item.to ||
                (item.to === "/workspace/idea-validation" && (pathname === "/workspace/validate" || pathname === "/workspace/venture-brief" || pathname === "/workspace/validation-summary"));

              let isCompleted = false;
              let isCurrent = false;

              if (item.to === "/workspace/idea-validation") {
                isCompleted = journey.completedStages.ideaValidation;
                isCurrent = journey.currentStage === "idea_validation";
              } else if (item.to === "/workspace/mvp-scope") {
                isCompleted = journey.completedStages.mvpScope;
                isCurrent = journey.currentStage === "mvp_scope";
              } else if (item.to === "/workspace/build-roadmap") {
                isCompleted = journey.completedStages.roadmap;
                isCurrent = journey.currentStage === "roadmap";
              } else if (item.to === "/workspace/marketing-plan") {
                isCompleted = journey.completedStages.marketingPlan;
                isCurrent = journey.currentStage === "marketing_plan";
              } else if (
                item.to === "/workspace/launch-sprint" ||
                item.to === "/workspace/traction" ||
                item.to === "/workspace/investor-update"
              ) {
                isCompleted = false;
                isCurrent = journey.currentStage === "growth";
              }

              const handleItemClick = (e: React.MouseEvent) => {
                const access = checkRouteAccess(item.to, venture);
                if (!access.allowed) {
                  e.preventDefault();
                  toast.error(access.title, {
                    description: access.description,
                  });
                  onNavigate?.();
                  return;
                }
                navigate({ to: item.to as any });
                onNavigate?.();
              };

              const isIdeaValidation = item.to === "/workspace/idea-validation";
              const validationSessions = venture?.validationSessions || [];

              return (
                <div key={item.to} className="space-y-1">
                  <button
                    type="button"
                    onClick={handleItemClick}
                    className={cn(
                      "w-full group flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 relative text-left cursor-pointer",
                      active
                        ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA] font-semibold shadow-[0_0_20px_rgba(167,139,250,0.2)] border border-[rgba(139,92,246,0.3)]"
                        : "text-[#cbc3d7] hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCompleted ? (
                        <CheckCircle2 className="size-3.5 text-[#A78BFA] shrink-0" />
                      ) : isCurrent ? (
                        <ArrowRight className="size-3.5 text-[#A78BFA] shrink-0" />
                      ) : (
                        <span
                          className={cn(
                            "size-1.5 rounded-full transition-all shrink-0",
                            active ? "bg-[#A78BFA] shadow-[0_0_8px_#A78BFA] scale-110" : "bg-white/20 group-hover:bg-[#A78BFA]/50",
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isCompleted && !active ? (
                      <span className="text-[10px] font-mono text-[#A78BFA]/80">✓ Done</span>
                    ) : null}
                  </button>

                  {/* Nested Validation History & "+ New Validation" inside Sidebar */}
                  {isIdeaValidation && (
                    <div className="pl-3 pr-1 py-1 space-y-1.5 border-l border-[rgba(139,92,246,0.2)] ml-3 my-1">
                      {/* "+ Validate Another Idea" Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentHasProgress =
                            venture?.validationState?.completed ||
                            venture?.validationState?.answers?.question1 ||
                            (venture?.chat && venture.chat.length > 1);

                          if (currentHasProgress) {
                            const sessionTitle =
                              venture.validationState?.answers?.question1 ||
                              venture.brief?.problem ||
                              venture.brief?.building ||
                              venture.name ||
                              `Validated Idea (${new Date().toLocaleDateString()})`;

                            const cleanTitle = sessionTitle.length > 30 ? sessionTitle.slice(0, 30) + "..." : sessionTitle;

                            const newSession = {
                              id: uid(),
                              title: cleanTitle,
                              createdAt: new Date().toISOString(),
                              validationState: venture.validationState,
                              ideaScore: venture.ideaScore || null,
                              chat: venture.chat || [],
                              brief: venture.brief,
                            };

                            update((v) => ({
                              ...v,
                              validationSessions: [newSession, ...(v.validationSessions || []).filter((s) => s.id !== newSession.id)],
                              chat: [
                                {
                                  id: uid(),
                                  role: "assistant",
                                  content: "I am your FounderOS Idea Validation Coach. What specific problem are you solving, and who is the exact target customer experiencing it?",
                                  createdAt: new Date().toISOString(),
                                },
                              ],
                              validationState: {
                                currentQuestion: 1,
                                answers: { question1: null, question2: null, question3: null, question4: null, question5: null },
                                completed: false,
                                score: null,
                              },
                              ideaScore: null,
                            }));
                            toast.success("Saved previous chat! Started fresh idea validation.");
                          } else {
                            update((v) => ({
                              ...v,
                              chat: [
                                {
                                  id: uid(),
                                  role: "assistant",
                                  content: "I am your FounderOS Idea Validation Coach. What specific problem are you solving, and who is the exact target customer experiencing it?",
                                  createdAt: new Date().toISOString(),
                                },
                              ],
                              validationState: {
                                currentQuestion: 1,
                                answers: { question1: null, question2: null, question3: null, question4: null, question5: null },
                                completed: false,
                                score: null,
                              },
                              ideaScore: null,
                            }));
                            toast.info("Started fresh idea validation.");
                          }
                          navigate({ to: "/workspace/idea-validation" as any });
                          onNavigate?.();
                        }}
                        className="w-full flex items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#A78BFA] hover:bg-[rgba(139,92,246,0.15)] transition border border-[rgba(139,92,246,0.25)] border-dashed cursor-pointer font-mono"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Plus className="size-3 shrink-0" />
                          <span className="truncate">+ Validate Another Idea</span>
                        </span>
                      </button>

                      {/* Saved Sessions in History */}
                      {validationSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            update((v) => ({
                              ...v,
                              chat: session.chat,
                              validationState: session.validationState,
                              ideaScore: session.ideaScore,
                              brief: session.brief || v.brief,
                            }));
                            toast.success(`Loaded saved validation: "${session.title}"`);
                            navigate({ to: "/workspace/idea-validation" as any });
                            onNavigate?.();
                          }}
                          className="group flex items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#cbc3d7] hover:text-white hover:bg-white/5 transition cursor-pointer"
                        >
                          <span className="truncate text-[11px] group-hover:text-[#A78BFA]">
                            {session.title || "Validated Idea"}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {session.ideaScore?.overallScore ? (
                              <span className="font-mono text-[9px] font-bold text-[#A78BFA] bg-[rgba(139,92,246,0.2)] px-1 py-0.2 rounded">
                                {session.ideaScore.overallScore}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                update((v) => ({
                                  ...v,
                                  validationSessions: (v.validationSessions || []).filter((s) => s.id !== session.id),
                                }));
                                toast.info("Removed validation session.");
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-[#958ea0] hover:text-rose-400 rounded transition"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Profile & Settings */}
      <div className="border-t border-white/5 pt-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full border border-[#A78BFA]/40 bg-[#A78BFA]/15 text-[#A78BFA] font-bold text-sm">
            {(app.user?.name ?? "F").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{app.user?.name ?? "Founder"}</p>
            <p className="truncate text-[11px] text-[#958ea0]">{app.user?.email ?? ""}</p>
          </div>

          {/* Account Settings Modal Trigger */}
          <button
            type="button"
            aria-label="Account Settings"
            title="Account Settings"
            onClick={() => setShowSettings(true)}
            className="rounded-lg p-1.5 text-[#958ea0] transition hover:bg-white/5 hover:text-white"
          >
            <Settings className="size-4" />
          </button>

          {/* Sign Out Trigger */}
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-[#958ea0] transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showSettings ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-md os-window-open">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#101417] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.8)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-[#A78BFA]" />
                <h2 className="text-lg font-bold text-white">Account Settings</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1 text-[#958ea0] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="rounded-xl border border-white/5 bg-[#0b0f12] p-4 space-y-2">
                <p className="text-[10px] uppercase text-[#958ea0]">Authenticated Founder</p>
                <p className="text-sm font-semibold text-white">{app.user?.name}</p>
                <p className="text-[#cbc3d7]">{app.user?.email}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0b0f12] p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#958ea0]">Total Ventures:</span>
                  <span className="font-semibold text-white">{app.ventures.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#958ea0]">Current Active Venture:</span>
                  <span className="font-semibold text-[#A78BFA] truncate max-w-[180px]">{venture?.name ?? "None"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#958ea0]">Data Isolation:</span>
                  <span className="text-[#A78BFA]">100% Encrypted & Isolated</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                  Close Settings
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[#cbc3d7] hover:text-white">
                  <LogOut className="size-3.5 mr-1" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Close navigation"
        className="absolute inset-0 bg-[#020408]/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] border-r border-[rgba(139,92,246,0.25)] bg-[#0b0f12] shadow-2xl">
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="absolute right-3 top-4 z-10 rounded-lg p-2 text-[#958ea0] hover:text-white"
        >
          <X className="size-4" />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}