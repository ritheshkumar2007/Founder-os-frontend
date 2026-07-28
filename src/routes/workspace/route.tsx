import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatDock } from "@/components/founderos/ChatDock";
import { MobileSidebar, Sidebar } from "@/components/founderos/Sidebar";
import { useAppState } from "@/lib/founderos/store";

export const Route = createFileRoute("/workspace")({
  ssr: false,
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const app = useAppState();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!app.user) navigate({ to: "/signin", replace: true });
  }, [app.user, navigate]);

  if (!app.user) return null;

  return (
    <div className="hero-glow grain flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border lg:block">
        <Sidebar />
      </aside>
      <MobileSidebar open={menu} onClose={() => setMenu(false)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <button
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
            className="rounded-lg border border-border p-2"
          >
            <Menu className="size-4" />
          </button>
          <span className="font-display">FounderOS</span>
        </div>
        <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 pb-32 sm:px-8 sm:py-12">
          <Outlet />
        </main>
      </div>

      <ChatDock />
    </div>
  );
}