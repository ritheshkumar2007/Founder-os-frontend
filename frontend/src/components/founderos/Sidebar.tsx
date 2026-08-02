import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut, Plus, Settings, X, Shield, Rocket, Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { addVenture, setActiveVenture, signOut, useActiveVenture } from "@/lib/founderos/store";
import { Button } from "@/components/founderos/ui";

export interface NavSection {
  category: string;
  items: { to: string; label: string }[];
}

export const STAGED_NAV: NavSection[] = [
  {
    category: "Idea Validation",
    items: [
      { to: "/workspace/idea-validation", label: "Idea Validation.app" },
    ],
  },
  {
    category: "Build",
    items: [
      { to: "/workspace/mvp-scope", label: "MVP Scope.app" },
      { to: "/workspace/build-roadmap", label: "Build Roadmap.app" },
    ],
  },
  {
    category: "Go To Market",
    items: [
      { to: "/workspace/marketing-plan", label: "Marketing Plan.app" },
    ],
  },
  {
    category: "Growth",
    items: [
      { to: "/workspace/launch-sprint", label: "Launch Sprint.app" },
      { to: "/workspace/traction", label: "Traction.app" },
      { to: "/workspace/investor-update", label: "Investor Update.app" },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { app, venture } = useActiveVenture();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openSelector, setOpenSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="flex h-full flex-col gap-5 bg-[#121924] p-5 relative select-none border-r border-white/5">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 group">
        <span className="grid size-9 place-items-center rounded-xl border border-[#4F8CFF]/40 bg-[#4F8CFF]/15 font-display text-[#4F8CFF] text-base font-bold shadow-[0_0_15px_rgba(79,140,255,0.3)]">
          <Rocket className="size-4 text-[#4F8CFF]" />
        </span>
        <div className="flex flex-col">
          <span className="font-display text-base font-bold text-[#F5F8FC] tracking-tight">
            Founder<span className="text-[#4F8CFF]">OS</span>
          </span>
          <span className="text-[10px] font-mono text-[#A8B3C7] uppercase tracking-widest -mt-0.5">
            Startup Workspace
          </span>
        </div>
      </Link>

      {/* New Venture CTA */}
      <button
        type="button"
        onClick={handleCreateVenture}
        className="btn-system inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_0_20px_rgba(79,140,255,0.25)] transition hover:brightness-110 active:scale-[0.98]"
      >
        <Plus className="size-4" /> New Venture
      </button>

      {/* Venture Selector Dropdown */}
      <div className="relative">
        <label className="text-[10px] uppercase tracking-wider font-mono text-[#A8B3C7]/80 mb-1.5 block px-1">
          Active Venture
        </label>
        <button
          type="button"
          onClick={() => setOpenSelector((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#0E131C]/80 px-3.5 py-2.5 text-left text-sm font-medium text-[#F5F8FC] transition hover:bg-white/5 hover:border-[#4F8CFF]/30"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="size-3.5 text-[#64D8FF] shrink-0" />
            <span className="truncate">{venture?.name ?? "Select Venture"}</span>
          </div>
          <ChevronDown className={cn("size-4 text-[#A8B3C7] transition-transform duration-200", openSelector && "rotate-180")} />
        </button>

        {openSelector ? (
          <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0E131C] p-1 shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl">
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
                    v.id === venture?.id ? "text-[#4F8CFF] font-semibold bg-[#4F8CFF]/10" : "text-[#F5F8FC]",
                  )}
                >
                  <span className="truncate">{v.name}</span>
                  {v.id === venture?.id ? <span className="size-1.5 rounded-full bg-[#4F8CFF] shadow-[0_0_8px_#4F8CFF] shrink-0" /> : null}
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
            <p className="px-2 text-[10px] uppercase font-mono tracking-widest text-[#A8B3C7]/60">
              {section.category}
            </p>
            {section.items.map((item) => {
              const active =
                pathname === item.to ||
                (item.to === "/workspace/idea-validation" && (pathname === "/workspace/validate" || pathname === "/workspace/venture-brief" || pathname === "/workspace/validation-summary"));

              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 relative",
                    active
                      ? "bg-[#4F8CFF]/15 text-[#4F8CFF] font-semibold shadow-[0_0_20px_rgba(79,140,255,0.2)] border border-[#4F8CFF]/25"
                      : "text-[#A8B3C7] hover:bg-white/5 hover:text-[#F5F8FC]",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-all",
                      active ? "bg-[#4F8CFF] shadow-[0_0_8px_#4F8CFF] scale-110" : "bg-white/20 group-hover:bg-[#4F8CFF]/50",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Profile & Settings */}
      <div className="border-t border-white/5 pt-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full border border-[#4F8CFF]/40 bg-[#4F8CFF]/15 text-[#4F8CFF] font-bold text-sm">
            {(app.user?.name ?? "F").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#F5F8FC]">{app.user?.name ?? "Founder"}</p>
            <p className="truncate text-[11px] text-[#A8B3C7]">{app.user?.email ?? ""}</p>
          </div>

          {/* Account Settings Modal Trigger */}
          <button
            type="button"
            aria-label="Account Settings"
            title="Account Settings"
            onClick={() => setShowSettings(true)}
            className="rounded-lg p-1.5 text-[#A8B3C7] transition hover:bg-white/5 hover:text-[#F5F8FC]"
          >
            <Settings className="size-4" />
          </button>

          {/* Sign Out Trigger */}
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-[#A8B3C7] transition hover:bg-white/5 hover:text-[#F5F8FC]"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showSettings ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0F]/80 backdrop-blur-md os-window-open">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161F2D] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.6)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-[#64D8FF]" />
                <h2 className="text-lg font-bold text-[#F5F8FC]">Account Settings</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1 text-[#A8B3C7] hover:text-[#F5F8FC]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/5 bg-[#0E131C] p-4 space-y-2">
                <p className="text-[10px] uppercase font-mono text-[#A8B3C7]">Authenticated Founder</p>
                <p className="text-sm font-semibold text-[#F5F8FC]">{app.user?.name}</p>
                <p className="text-[#A8B3C7]">{app.user?.email}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0E131C] p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#A8B3C7]">Total Ventures:</span>
                  <span className="font-semibold text-[#F5F8FC]">{app.ventures.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A8B3C7]">Current Active Venture:</span>
                  <span className="font-semibold text-[#4F8CFF] truncate max-w-[180px]">{venture?.name ?? "None"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#A8B3C7]">Data Isolation:</span>
                  <span className="text-[#46E3A3] font-mono">100% Encrypted & Isolated</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                  Close Settings
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[#FF6B6B] hover:text-[#FF6B6B]/80">
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
        className="absolute inset-0 bg-[#080A0F]/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 w-72 border-r border-white/5 bg-[#121924]">
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="absolute right-3 top-4 z-10 rounded-lg p-2 text-[#A8B3C7] hover:text-[#F5F8FC]"
        >
          <X className="size-4" />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}