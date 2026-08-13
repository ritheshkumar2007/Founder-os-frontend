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
    <div className="flex h-full flex-col gap-5 bg-[#0b0f12] p-5 relative select-none border-r border-white/10">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 group">
        <span className="grid size-9 place-items-center rounded-xl border border-[#d4d4d8]/40 bg-zinc-800/15 font-display text-zinc-300 text-base font-bold shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <Rocket className="size-4 text-zinc-300" />
        </span>
        <div className="flex flex-col">
          <span className="font-display text-base font-bold text-white tracking-tight">
            Founder<span className="text-zinc-300">OS</span>
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
        className="btn-system inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition hover:brightness-110 active:scale-[0.98] cursor-pointer text-white"
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
          className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#101417] px-3.5 py-2.5 text-left text-sm font-medium text-white transition hover:bg-white/5 hover:border-white/30/40"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="size-3.5 text-zinc-300 shrink-0" />
            <span className="truncate">{venture?.name ?? "Select Venture"}</span>
          </div>
          <ChevronDown className={cn("size-4 text-[#958ea0] transition-transform duration-200", openSelector && "rotate-180")} />
        </button>

        {openSelector ? (
          <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#101417] p-1 shadow-[0_20px_45px_rgba(0,0,0,0.8)] backdrop-blur-xl">
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
                    v.id === venture?.id ? "text-zinc-300 font-semibold bg-zinc-800/10" : "text-white",
                  )}
                >
                  <span className="truncate">{v.name}</span>
                  {v.id === venture?.id ? <span className="size-1.5 rounded-full bg-zinc-800 shadow-[0_0_8px_#d4d4d8] shrink-0" /> : null}
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

              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 relative",
                    active
                      ? "bg-zinc-800/60 text-zinc-300 font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10"
                      : "text-[#cbc3d7] hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-all",
                      active ? "bg-zinc-800 shadow-[0_0_8px_#d4d4d8] scale-110" : "bg-white/20 group-hover:bg-zinc-800/50",
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
          <span className="grid size-9 place-items-center rounded-full border border-[#d4d4d8]/40 bg-zinc-800/15 text-zinc-300 font-bold text-sm">
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
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101417] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.8)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-zinc-300" />
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
                  <span className="font-semibold text-zinc-300 truncate max-w-[180px]">{venture?.name ?? "None"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#958ea0]">Data Isolation:</span>
                  <span className="text-zinc-300">100% Encrypted & Isolated</span>
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