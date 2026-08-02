import React from "react";
import { Cpu, Zap, BarChart3, Radar, ShieldCheck, Terminal, Layers, ArrowUpRight, Sparkles } from "lucide-react";

const MODULES = [
  {
    id: "ai-copilot",
    title: "Venture AI Copilot",
    badge: "MISSION NEURAL CORE",
    description: "An intelligent copilot trained on thousands of successful venture launches. It continuously analyzes your market position, spots architectural risks, and auto-generates your technical documentation.",
    icon: Cpu,
    highlights: ["Context-aware decision engine", "Automated competitive intelligence", "24/7 technical copilot feedback"],
    floatClass: "animate-antigravity-slow",
  },
  {
    id: "sprint-flight-deck",
    title: "7-Day Sprint Flight Deck",
    badge: "TIME-BOXED EXECUTION",
    description: "Scope creep is the #1 killer of early startups. FounderOS enforces strict 7-day flight sprints, breaking complex MVPs down into daily shippable micro-sprints.",
    icon: Zap,
    highlights: ["Automated scope-creep warning system", "Daily flight log checklists", "Integrated PR & GitHub commit telemetry"],
    floatClass: "animate-antigravity-medium",
  },
  {
    id: "customer-radar",
    title: "Customer Validation Radar",
    badge: "PROBLEM SIGNAL MATRIX",
    description: "Upload customer interview audio or notes. AI synthesizes pain points, extracts quantitative willingness-to-pay scores, and builds your product requirement specs.",
    icon: Radar,
    highlights: ["Automated interview transcript parsing", "Willingness-to-pay heatmaps", "Feature request pain matrix"],
    floatClass: "animate-antigravity-fast",
  },
  {
    id: "data-room",
    title: "Automated VC Data Room",
    badge: "INVESTOR TELEMETRY",
    description: "Generate a shareable investor data room in one click. Clean cap tables, unit economics calculators, live MRR telemetry graphs, and interactive pitch brief links.",
    icon: BarChart3,
    highlights: ["Live investor telemetry dashboard", "Cap table & runway projection engine", "Instant pitch brief export"],
    floatClass: "animate-antigravity-fast",
  },
  {
    id: "tech-architect",
    title: "Architectural Blueprint Gen",
    badge: "PRECISION STACK SCOPER",
    description: "Get instant tech stack recommendations tailored to your venture scope. Auto-generate database schemas, API specs, and auth configurations ready for deployment.",
    icon: Layers,
    highlights: ["Tailored DB schemas & API specs", "Zero-vendor lock-in recommendations", "Production-ready boilerplate generators"],
    floatClass: "animate-antigravity-medium",
  },
  {
    id: "command-console",
    title: "Mission Telemetry Terminal",
    badge: "FOUNDER OPERATING SYSTEM",
    description: "One central command console to orchestrate your startup journey. Track burn rate, team velocity, launch countdowns, and investor signals in real time.",
    icon: Terminal,
    highlights: ["Single pane of glass for all venture data", "Customizable telemetry widgets", "Real-time system health checks"],
    floatClass: "animate-antigravity-slow",
  },
];

export const ModulesGrid: React.FC = () => {
  return (
    <section id="modules" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Soft background glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#4F8CFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#0E131C] text-xs font-mono text-[#64D8FF]">
          <Sparkles className="size-3.5 text-[#4F8CFF]" />
          <span>STARTUP OS APP MODULES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-display text-[#F5F8FC] tracking-tight">
          Engineered for Founders Who <br />
          <span className="text-gradient-system">Refuse to Waste Time on Bloat</span>
        </h2>
        <p className="text-base text-[#A8B3C7]">
          Seven integrated application modules designed to take you from a blank screen to a market-ready venture.
        </p>
      </div>

      {/* 6 Anti-Gravity Suspended Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className={`glass-card p-8 group flex flex-col justify-between border border-white/[0.08] hover:border-[#4F8CFF]/50 relative overflow-hidden transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] ${mod.floatClass}`}
            >
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-2xl bg-[#07111F] border border-[#4F8CFF]/40 text-[#4F8CFF] flex items-center justify-center shadow-[0_0_20px_rgba(79,140,255,0.25)] group-hover:scale-110 transition-all">
                    <Icon className="size-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#0B1628] border border-white/[0.08] text-[#9FD3FF]">
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-display text-white group-hover:text-[#4F8CFF] transition-colors flex items-center gap-2">
                    <span>{mod.title}</span>
                    <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F8CFF]" />
                  </h3>
                  <p className="text-xs text-[#AAB7CC] leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {mod.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/80 font-mono">
                      <span className="size-1.5 rounded-full bg-[#4F8CFF]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#6AAEFF] opacity-80 group-hover:opacity-100 transition-opacity">
                <span>MODULE ACTIVE</span>
                <span>STATUS 100%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
