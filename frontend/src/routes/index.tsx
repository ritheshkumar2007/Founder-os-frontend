import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Terminal, CheckCircle2, LayoutGrid } from "lucide-react";

import { StarfieldBackground } from "@/components/founderos/StarfieldBackground";
import { MouseSpotlight } from "@/components/founderos/MouseSpotlight";
import { MagneticButton } from "@/components/founderos/MagneticButton";
import { Navbar } from "@/components/founderos/Navbar";
import { InteractiveHeroDashboard } from "@/components/founderos/InteractiveHeroDashboard";
import { TechMarquee } from "@/components/founderos/TechMarquee";
import { TrajectoryStoryline } from "@/components/founderos/TrajectoryStoryline";
import { ModulesGrid } from "@/components/founderos/ModulesGrid";
import { TelemetryPlayground } from "@/components/founderos/TelemetryPlayground";
import { GlobalOrbitalCanvas } from "@/components/founderos/GlobalOrbitalCanvas";
import { TestimonialsAndMetrics } from "@/components/founderos/TestimonialsAndMetrics";
import { FAQSection } from "@/components/founderos/FAQSection";
import { LaunchCTA } from "@/components/founderos/LaunchCTA";
import { Footer } from "@/components/founderos/Footer";

const TITLE = "FounderOS — The AI Startup Operating System";
const DESCRIPTION =
  "Purpose-built operating system for building startups. Turn raw vision into validated customer pain scores, 7-day sprint MVPs, and investor data rooms in a unified workspace.";

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
    <main className="relative min-h-screen bg-[#080A0F] text-[#F5F8FC] overflow-x-hidden selection:bg-[#4F8CFF]/30 selection:text-[#F5F8FC]">
      {/* Interactive Mouse Spotlight Radial Light Layer */}
      <MouseSpotlight />

      {/* OS Ambient Structural Grid Layer */}
      <StarfieldBackground />

      {/* Navigation Header */}
      <Navbar />

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 space-y-16">
        {/* Anti-Gravity Floating Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[480px] bg-gradient-to-r from-[#4F8CFF]/15 via-[#121924]/30 to-[#64D8FF]/15 rounded-full blur-[160px] pointer-events-none" />

        {/* Top Hero Text Content */}
        <div className="text-center max-w-4xl mx-auto space-y-8 relative z-10">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#0E131C] text-xs font-mono text-[#A9D6FF] shadow-sm">
            <span className="size-2 rounded-full bg-[#46E3A3] shadow-[0_0_8px_#46E3A3]" />
            <span className="text-[#64D8FF] font-bold">FOUNDEROS v2.5</span>
            <span>AI STARTUP OPERATING SYSTEM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold font-display tracking-tight text-[#F5F8FC] leading-[1.02]">
            The Operating System <br />
            <span className="text-gradient-system">For Building Startups</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#A8B3C7] font-normal leading-relaxed">
            Stop juggling fragmented tools. Step into <strong className="text-[#F5F8FC] font-semibold">FounderOS</strong> — move seamlessly from idea validation and 7-day MVP scoping to marketing execution and investor growth.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <MagneticButton>
              <Link
                to="/signin"
                className="btn-system w-full sm:w-auto px-8 py-4 rounded-2xl text-base flex items-center justify-center gap-3 group shadow-[0_0_25px_rgba(79,140,255,0.3)]"
              >
                <Sparkles className="size-5 text-[#64D8FF]" />
                <span>Enter Operating System</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>

            <MagneticButton>
              <a
                href="#modules"
                className="btn-frosted w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
              >
                <LayoutGrid className="size-5 text-[#4F8CFF]" />
                <span>Explore App Modules</span>
              </a>
            </MagneticButton>
          </div>

          {/* Trust Metrics Pill */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#A8B3C7]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#46E3A3]" /> 1,240+ Active Founders
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#46E3A3]" /> $420M+ Capital Raised
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#46E3A3]" /> 100% Data Isolated
            </span>
          </div>
        </div>

        {/* Operating System Interactive Desktop Hero Container */}
        <InteractiveHeroDashboard />
      </section>

      {/* INFINITE TECH ECOSYSTEM MARQUEE */}
      <TechMarquee />

      {/* STORYLINE TRAJECTORY SECTION */}
      <TrajectoryStoryline />

      {/* MODULES SHOWCASE SECTION */}
      <ModulesGrid />

      {/* LIVE COMMAND SIMULATOR SECTION */}
      <TelemetryPlayground />

      {/* GLOBAL ECOSYSTEM NETWORK SECTION */}
      <GlobalOrbitalCanvas />

      {/* TESTIMONIALS & METRICS */}
      <TestimonialsAndMetrics />

      {/* FAQ SECTION */}
      <FAQSection />

      {/* LAUNCH CTA */}
      <LaunchCTA />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
