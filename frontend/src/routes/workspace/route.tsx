import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Menu, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatDock } from "@/components/founderos/ChatDock";
import { MobileSidebar, Sidebar, STAGED_NAV } from "@/components/founderos/Sidebar";
import { setLastRoute, useAppState } from "@/lib/founderos/store";

export const Route = createFileRoute("/workspace")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const app = useAppState();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menu, setMenu] = useState(false);

  // Derive current module name
  const currentItem = STAGED_NAV.flatMap((s) => s.items).find((i) => i.to === pathname);
  const activeAppName = currentItem ? currentItem.label : "FounderOS Workspace.app";

  const userEmail = app.user?.email;

  useEffect(() => {
    if (!userEmail) {
      const redirectUrl = pathname && pathname.startsWith("/workspace") ? pathname : "/workspace/idea-validation";
      navigate({
        to: "/signin",
        search: { redirect: redirectUrl },
        replace: true,
      });
    } else if (pathname) {
      setLastRoute(pathname);
    }
  }, [userEmail, navigate, pathname]);

  if (!app.user) return null;

  return (
    <div className="bg-[#020408] min-h-screen flex selection:bg-[#A78BFA]/30 selection:text-white">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[rgba(139,92,246,0.2)] bg-[#0b0f12] lg:block">
        <Sidebar />
      </aside>
      <MobileSidebar open={menu} onClose={() => setMenu(false)} />

      <div className="min-w-0 flex-1 flex flex-col bg-[#020408]">
        {/* Desktop OS Title Bar & Window Controls */}
        <header className="flex items-center justify-between border-b border-[rgba(139,92,246,0.2)] bg-[#0b0f12]/95 backdrop-blur-xl px-3.5 sm:px-5 py-2.5 sm:py-3 select-none gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Trigger */}
            <button
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
              className="lg:hidden rounded-lg border border-white/10 p-2 text-[#958ea0] hover:text-white hover:bg-white/5 min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
            >
              <Menu className="size-4" />
            </button>

            {/* Window Controls */}
            <div className="hidden sm:flex items-center gap-2 mr-2 shrink-0">
              <span className="size-2.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]" />
              <span className="size-2.5 rounded-full bg-[#8B5CF6]/60 border border-[rgba(139,92,246,0.4)]" />
              <span className="size-2.5 rounded-full bg-[#1c2023] border border-white/10" />
            </div>

            {/* Window Title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-medium text-white bg-[#101417] border border-[rgba(139,92,246,0.3)] px-2.5 py-1 rounded-md shadow-inner truncate">
                {activeAppName}
              </span>
              <span className="hidden md:inline text-[11px] font-mono text-[#958ea0] truncate">
                — FounderOS Startup OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* User Session Badge */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#cbc3d7] bg-[#101417] border border-[rgba(139,92,246,0.2)] px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5 text-[#A78BFA]" />
              <span className="text-white font-semibold">{app.user.name}</span>
            </div>

            {/* Auto-Save Status Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#101417] shadow-sm">
              {app.saveStatus === "saving" ? (
                <>
                  <Loader2 className="size-3 sm:size-3.5 animate-spin text-[#A78BFA]" />
                  <span className="text-[#A78BFA] font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <span className="size-1.5 sm:size-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA] animate-pulse" />
                  <span className="text-white font-medium hidden xs:inline">Auto-Saved</span>
                  <span className="text-white font-medium xs:hidden">Saved</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Operating System Window Workspace Content */}
        <main className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8 px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 pb-32 flex-1 os-window-open min-w-0">
          <Outlet />
        </main>
      </div>

      <ChatDock />
    </div>
  );
}