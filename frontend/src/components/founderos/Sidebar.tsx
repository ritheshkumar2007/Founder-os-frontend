import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, LogOut, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { addVenture, setActiveVenture, signOut, useActiveVenture } from "@/lib/founderos/store";

export const NAV = [
  { to: "/workspace/venture-brief", label: "Venture Brief" },
  { to: "/workspace/validate", label: "Validate" },
  { to: "/workspace/validation-summary", label: "Validation Summary" },
  { to: "/workspace/mvp-scope", label: "MVP Scope" },
  { to: "/workspace/build-roadmap", label: "Build Roadmap" },
  { to: "/workspace/marketing-plan", label: "Marketing Plan" },
  { to: "/workspace/launch-sprint", label: "Launch Sprint" },
  { to: "/workspace/traction", label: "Traction" },
  { to: "/workspace/investor-update", label: "Investor Update" },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { app, venture } = useActiveVenture();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-5">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl border border-lime/30 bg-forest/40 font-display text-lime">
          F
        </span>
        <span className="font-display text-lg text-sidebar-foreground">FounderOS</span>
      </Link>

      <button
        type="button"
        onClick={() => {
          const name = window.prompt("Name your new venture", "Untitled Venture");
          if (name === null) return;
          addVenture(name.trim() || "Untitled Venture");
          navigate({ to: "/workspace/venture-brief" });
          onNavigate?.();
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-medium text-lime-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
      >
        <Plus className="size-4" /> New Venture
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-xl border border-sidebar-border bg-surface/50 px-3 py-2.5 text-left text-sm text-sidebar-foreground transition hover:bg-sidebar-accent"
        >
          <span className="truncate">{venture?.name ?? "No venture"}</span>
          <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
        </button>
        {open ? (
          <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-sidebar-border bg-popover p-1 shadow-[var(--shadow-panel)]">
            {app.ventures.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveVenture(v.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full truncate rounded-lg px-3 py-2 text-left text-sm transition hover:bg-sidebar-accent",
                    v.id === venture?.id ? "text-lime" : "text-sidebar-foreground",
                  )}
                >
                  {v.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV.map((item, i) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <span
                className={cn(
                  "h-4 w-px transition-colors",
                  active ? "bg-lime" : "bg-border group-hover:bg-lime/50",
                )}
              />
              <span className="tabular-nums text-[11px] text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full border border-border bg-surface-2 text-sm">
            {(app.user?.name ?? "F").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-sidebar-foreground">{app.user?.name ?? "Founder"}</p>
            <p className="truncate text-xs text-muted-foreground">{app.user?.email ?? ""}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              signOut();
              navigate({ to: "/signin" });
            }}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Close navigation"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border">
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="absolute right-3 top-4 z-10 rounded-lg p-2 text-muted-foreground"
        >
          <X className="size-4" />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}