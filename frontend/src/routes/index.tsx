import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NAV } from "@/components/founderos/Sidebar";

const TITLE = "FounderOS — From idea to traction, one venture at a time";
const DESCRIPTION =
  "FounderOS is the operating system for early founders: venture brief, customer validation, MVP scope, build roadmap, launch sprint and traction in one cinematic workspace.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="hero-glow grain min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl border border-lime/30 bg-forest/40 font-display text-lime">
              F
            </span>
            <span className="font-display text-lg">FounderOS</span>
          </div>
          <Link
            to="/signin"
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-accent"
          >
            Sign in
          </Link>
        </header>

        <section className="fade-rise py-24 sm:py-32">
          <p className="text-xs uppercase tracking-[0.32em] text-lime/80">The founder operating system</p>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">
            Go from a rough idea to real traction — without guessing.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            Nine guided steps, one workspace, and an AI copilot that knows your venture. Validate the
            problem, scope the smallest MVP, launch in seven days and report like a pro.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-medium text-lime-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
            >
              Enter the workspace <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="panel grain rounded-2xl p-8">
          <h2 className="text-xs uppercase tracking-[0.24em] text-muted-foreground">The nine steps</h2>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {NAV.map((item, i) => (
              <li key={item.to} className="flex items-baseline gap-3 border-b border-border/60 py-2">
                <span className="text-xs tabular-nums text-lime/70">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="py-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FounderOS
        </footer>
      </div>
    </main>
  );
}
