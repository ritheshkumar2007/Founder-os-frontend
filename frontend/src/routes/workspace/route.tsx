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
    <div className="bg-midnight-aurora min-h-screen flex selection:bg-[#4F8CFF]/30 selection:text-[#F5F8FC]">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/5 bg-[#121924] lg:block">
        <Sidebar />
      </aside>
      <MobileSidebar open={menu} onClose={() => setMenu(false)} />

      <div className="min-w-0 flex-1 flex flex-col bg-[#080A0F]/60">
        {/* Desktop OS Title Bar & Window Controls */}
        <header className="flex items-center justify-between border-b border-white/5 bg-[#0E131C]/90 backdrop-blur-xl px-5 py-3 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
              className="lg:hidden rounded-lg border border-white/10 p-2 text-[#A8B3C7] hover:text-[#F5F8FC] hover:bg-white/5"
            >
              <Menu className="size-4" />
            </button>

            {/* Window Traffic Lights */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <span className="size-3 rounded-full bg-[#FF5F56]/90 border border-[#E0443E]/50 shadow-[0_0_8px_rgba(255,95,86,0.4)]" />
              <span className="size-3 rounded-full bg-[#FFBD2E]/90 border border-[#DEA123]/50 shadow-[0_0_8px_rgba(255,189,46,0.4)]" />
              <span className="size-3 rounded-full bg-[#27C93F]/90 border border-[#1AAB29]/50 shadow-[0_0_8px_rgba(39,201,63,0.4)]" />
            </div>

            {/* Window Title */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-medium text-[#F5F8FC] bg-[#161F2D] border border-white/10 px-2.5 py-1 rounded-md shadow-inner">
                {activeAppName}
              </span>
              <span className="hidden md:inline text-[11px] font-mono text-[#A8B3C7]/60">
                — FounderOS Startup OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Session Badge */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#A8B3C7] bg-[#121924] border border-white/5 px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5 text-[#64D8FF]" />
              <span className="text-[#F5F8FC] font-semibold">{app.user.name}</span>
            </div>

            {/* Auto-Save Status Badge */}
            <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-[#161F2D]/90 shadow-sm">
              {app.saveStatus === "saving" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-[#4F8CFF]" />
                  <span className="text-[#4F8CFF] font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-[#46E3A3] shadow-[0_0_8px_#46E3A3] animate-pulse" />
                  <span className="text-[#F5F8FC]/90 font-medium">Auto-Saved</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Operating System Window Workspace Content */}
        <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 pb-32 sm:px-8 sm:py-10 flex-1 os-window-open">
          <Outlet />
        </main>
      </div>

      <ChatDock />
    </div>
  );
}