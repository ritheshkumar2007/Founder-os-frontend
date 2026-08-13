import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "@/lib/founderos/store";
import { Navbar } from "@/components/founderos/Navbar";
import { Footer } from "@/components/founderos/Footer";
import { InteractiveHeroDashboard } from "@/components/founderos/InteractiveHeroDashboard";
import { TechMarquee } from "@/components/founderos/TechMarquee";
import { ModulesGrid } from "@/components/founderos/ModulesGrid";
import { TrajectoryStoryline } from "@/components/founderos/TrajectoryStoryline";
import { TelemetryPlayground } from "@/components/founderos/TelemetryPlayground";
import { GlobalOrbitalCanvas } from "@/components/founderos/GlobalOrbitalCanvas";
import { TestimonialsAndMetrics } from "@/components/founderos/TestimonialsAndMetrics";
import { FAQSection } from "@/components/founderos/FAQSection";
import { LaunchCTA } from "@/components/founderos/LaunchCTA";

const TITLE = "FounderOS - The Operating System for Building Startups";
const DESCRIPTION =
  "Deploy systems, manage assets, and scale operations with high-velocity precision. The crystal black dashboard designed for elite founders.";

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
      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 px-margin-mobile md:px-margin-desktop relative z-10 w-full max-w-[theme(spacing.max-width)] mx-auto space-y-24">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center max-w-4xl w-full">
          <h1 className="font-display-lg text-display-lg md:text-[80px] md:leading-[88px] text-white mb-6 tracking-tighter text-glow">
            The Operating System<br />
            for Building Startups
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12">
            Deploy systems, manage assets, and scale operations with high-velocity precision. The crystal black dashboard designed for elite founders.
          </p>

          {/* Interactive Glass Card */}
          <div className="glass-card rounded-xl p-8 md:p-12 w-full relative overflow-hidden mb-12 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {/* Inner Glow specific to card */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-zinc-800 opacity-20 rounded-full blur-[50px]" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <span
                className="material-symbols-outlined text-zinc-300 text-6xl"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                rocket_launch
              </span>
              <h2 className="font-headline-lg text-headline-lg text-white">
                Initialize Your Startup Engine
              </h2>
              <p className="font-label-mono text-label-mono text-on-secondary-container bg-surface-container/50 py-2 px-4 rounded border border-outline-variant">
                &gt; root@founder-os:~# ./deploy_startup --scale=hyper
              </p>
              <Link
                to={targetPath}
                className="btn-primary px-8 py-4 rounded-lg font-headline-md text-[18px] font-semibold flex items-center gap-3 active:scale-95 duration-200 mt-4 cursor-pointer"
              >
                <span>Enter Operating System</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Features Grid (Bento Style hint) */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            <div className="glass-card rounded-lg p-6 flex flex-col gap-4">
              <span className="material-symbols-outlined text-tertiary">speed</span>
              <h3 className="font-headline-md text-headline-md text-white text-lg">
                High-Velocity Operations
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Streamline your daily workflows with zero latency tools.
              </p>
            </div>
            <div className="glass-card rounded-lg p-6 flex flex-col gap-4">
              <span className="material-symbols-outlined text-primary">monitoring</span>
              <h3 className="font-headline-md text-headline-md text-white text-lg">
                Real-time Analytics
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Monitor crucial growth metrics on an obsidian canvas.
              </p>
            </div>
            <div className="glass-card rounded-lg p-6 flex flex-col gap-4">
              <span className="material-symbols-outlined text-zinc-300">hub</span>
              <h3 className="font-headline-md text-headline-md text-white text-lg">
                System Integration
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Connect all your vital startup assets in one unified terminal.
              </p>
            </div>
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

        {/* Application Modules Grid */}
        <section id="pricing" className="w-full">
          <ModulesGrid />
        </section>

        {/* Trajectory Storyline */}
        <section id="growth" className="w-full">
          <TrajectoryStoryline />
        </section>

        {/* Simulator & Telemetry Playground */}
        <section id="docs" className="w-full">
          <TelemetryPlayground />
        </section>

        {/* Global Ecosystem Orbital Canvas */}
        <section className="w-full">
          <GlobalOrbitalCanvas />
        </section>

        {/* Testimonials and Metrics */}
        <section className="w-full">
          <TestimonialsAndMetrics />
        </section>

        {/* FAQ Section */}
        <section className="w-full">
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

