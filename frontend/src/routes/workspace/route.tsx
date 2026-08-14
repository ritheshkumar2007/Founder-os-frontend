import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Menu, ShieldCheck, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatDock } from "@/components/founderos/ChatDock";
import { MobileSidebar, Sidebar, STAGED_NAV } from "@/components/founderos/Sidebar";
import { setLastRoute, useAppState, useActiveVenture } from "@/lib/founderos/store";
import { checkRouteAccess, getFounderJourney, getStageRoute } from "@/lib/founderos/journey";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workspace")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const app = useAppState();
  const { venture } = useActiveVenture();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menu, setMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("founderos_sidebar_open");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("founderos_sidebar_open", String(next));
      }
      return next;
    });
  };

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
      return;
    }

    if (pathname && pathname.startsWith("/workspace")) {
      const access = checkRouteAccess(pathname, venture);
      if (!access.allowed) {
        toast.error(access.title, {
          description: access.description,
        });
        navigate({
          to: access.redirectUrl as any,
          replace: true,
        });
        return;
      }
      setLastRoute(pathname);
    }
  }, [userEmail, navigate, pathname, venture]);

  if (!app.user) return null;

  return (
    <div className="bg-[#020408] h-screen max-h-screen w-screen overflow-hidden flex selection:bg-[#A78BFA]/30 selection:text-white">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "h-full shrink-0 border-r border-[rgba(139,92,246,0.2)] bg-[#0b0f12] hidden lg:block transition-all duration-300 ease-in-out z-20 overflow-hidden",
          sidebarOpen ? "w-72 opacity-100" : "w-0 border-r-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="w-72 h-full">
          <Sidebar onToggleCollapse={toggleSidebar} />
        </div>
      </aside>
      <MobileSidebar open={menu} onClose={() => setMenu(false)} />

      <div className="min-w-0 flex-1 flex flex-col h-full overflow-hidden bg-[#020408] transition-all duration-300">
        {/* Desktop OS Title Bar & Window Controls */}
        <header className="shrink-0 flex items-center justify-between border-b border-[rgba(139,92,246,0.2)] bg-[#0b0f12]/95 backdrop-blur-xl px-3.5 sm:px-5 py-2.5 sm:py-3 select-none gap-2 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Desktop Sidebar Open Toggle Button (Visible when sidebar is closed) */}
            {!sidebarOpen && (
              <button
                aria-label="Open sidebar"
                title="Open sidebar"
                onClick={toggleSidebar}
                className="hidden lg:flex rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.15)] hover:bg-[rgba(139,92,246,0.25)] p-1.5 text-[#A78BFA] hover:text-white transition items-center justify-center shrink-0 cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.25)]"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
              className="lg:hidden rounded-lg border border-white/10 p-2 text-[#958ea0] hover:text-white hover:bg-white/5 min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0 cursor-pointer"
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
        <main
          className={cn(
            "flex-1 min-w-0 flex flex-col os-window-open",
            pathname === "/workspace/idea-validation"
              ? "w-full max-w-none p-0 overflow-hidden"
              : "w-full overflow-y-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 pb-32"
          )}
        >
          {pathname === "/workspace/idea-validation" ? (
            <Outlet />
          ) : (
            <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      <ChatDock />
    </div>
  );
}