import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "@/lib/founderos/store";
import { Navbar } from "@/components/founderos/Navbar";
import { Footer } from "@/components/founderos/Footer";
import { InteractiveHeroDashboard } from "@/components/founderos/InteractiveHeroDashboard";
import { TechMarquee } from "@/components/founderos/TechMarquee";
import { ModulesGrid } from "@/components/founderos/ModulesGrid";
import { TrajectoryStoryline } from "@/components/founderos/TrajectoryStoryline";
import { TelemetryPlayground } from "@/components/founderos/TelemetryPlayground";
import { TestimonialsAndMetrics } from "@/components/founderos/TestimonialsAndMetrics";
import { FAQSection } from "@/components/founderos/FAQSection";
import { LaunchCTA } from "@/components/founderos/LaunchCTA";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const TITLE = "FounderOS - The Operating System for Building Startups";
const DESCRIPTION =
  "From raw idea to a live, fundable venture. Validate customer demand, scope precision MVPs, execute 7-day sprints, and manage investor data rooms.";

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
  const app = useAppState();
  const targetPath = app.user ? "/workspace/idea-validation" : "/signin";

  return (
    <div className="bg-crystal-obsidian text-on-surface min-h-screen flex flex-col font-body-md overflow-x-hidden relative">
      {/* Ambient Glow */}
      <div className="glow-bg" />

      {/* Top Navigation (Shell) */}
      <Navbar />

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto space-y-20 sm:space-y-28">
        {/* Streamlined Hero Section */}
        <section className="text-center flex flex-col items-center max-w-4xl w-full mx-auto space-y-6 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-xs font-mono text-[#A78BFA] shadow-sm">
            <Sparkles className="size-3.5 text-[#A78BFA]" />
            <span>STARTUP OPERATING SYSTEM</span>
          </div>

          <h1 className="font-display-lg text-4xl sm:text-6xl md:text-[76px] md:leading-[84px] text-white tracking-tight text-glow font-bold">
            The Operating System <br />
            for Building Startups
          </h1>

          <p className="font-body-lg text-sm sm:text-base md:text-lg text-[#cbc3d7] max-w-2xl mx-auto leading-relaxed">
            From raw idea to a live, fundable venture. Validate customer demand, eliminate feature bloat, execute 7-day build sprints, and export investor data rooms in one workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto">
            <Link
              to={targetPath}
              className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-xl font-headline-md text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 active:scale-95 duration-200 cursor-pointer bg-[#A78BFA] text-black hover:bg-[#bfa8ff] shadow-[0_0_25px_rgba(139,92,246,0.35)]"
            >
              <span>Enter Operating System</span>
              <ArrowRight className="size-4 text-black" />
            </Link>
            <a
              href="#trajectory"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-mono text-[#cbc3d7] hover:text-white border border-white/10 bg-[#0b0f12] hover:bg-[#101417] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore 5-Stage System</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs font-mono text-[#958ea0]">
            <span className="flex items-center gap-1.5 text-[#cbc3d7]">
              <CheckCircle2 className="size-3.5 text-[#A78BFA]" /> 1,240+ Startups Launched
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#cbc3d7]">
              <CheckCircle2 className="size-3.5 text-[#A78BFA]" /> 7-Day Average Sprint
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#cbc3d7]">
              <CheckCircle2 className="size-3.5 text-[#A78BFA]" /> $420M+ Raised
            </span>
          </div>
        </section>

        {/* Interactive OS Dashboard Container */}
        <section className="w-full">
          <InteractiveHeroDashboard />
        </section>

        {/* Tech Ecosystem Marquee */}
        <section className="w-full">
          <TechMarquee />
        </section>

        {/* 5-Stage Sequential System Framework */}
        <section id="trajectory" className="w-full">
          <TrajectoryStoryline />
        </section>

        {/* Interactive AI Simulator (Single Earned Terminal Console) */}
        <section id="simulator" className="w-full">
          <TelemetryPlayground />
        </section>

        {/* Core Capabilities Asymmetric Bento Grid */}
        <section id="features" className="w-full">
          <ModulesGrid />
        </section>

        {/* Social Proof & Varied Testimonials */}
        <section id="reviews" className="w-full">
          <TestimonialsAndMetrics />
        </section>

        {/* FAQ Section (2-Column Sticky Split) */}
        <section id="faq" className="w-full">
          <FAQSection />
        </section>

        {/* Launch CTA */}
        <section className="w-full">
          <LaunchCTA />
        </section>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-safe bg-surface-container-lowest/80 dark:bg-surface-container-lowest/80 backdrop-blur-xl border-t border-glass-border shadow-[0_-5px_15px_rgba(0,0,0,0.5)] rounded-t-xl">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-primary font-bold bg-surface-glow rounded-xl px-3 py-1 active:scale-90 duration-300"
        >
          <span
            className="material-symbols-outlined mb-1"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            dashboard
          </span>
          <span className="font-caption text-caption">Terminal</span>
        </Link>
        <a
          href="#features"
          className="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all rounded-xl px-3 py-1 active:scale-90 duration-300"
        >
          <span className="material-symbols-outlined mb-1">account_balance_wallet</span>
          <span className="font-caption text-caption">Assets</span>
        </a>
        <a
          href="#growth"
          className="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all rounded-xl px-3 py-1 active:scale-90 duration-300"
        >
          <span className="material-symbols-outlined mb-1">trending_up</span>
          <span className="font-caption text-caption">Growth</span>
        </a>
        <Link
          to={targetPath}
          className="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all rounded-xl px-3 py-1 active:scale-90 duration-300"
        >
          <span className="material-symbols-outlined mb-1">settings</span>
          <span className="font-caption text-caption">Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <Footer />
    </div>
  );
}

