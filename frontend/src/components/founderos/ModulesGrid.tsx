import React from "react";
import { Cpu, Zap, BarChart3, Radar, Layers, Terminal, ArrowUpRight, Sparkles } from "lucide-react";

const MODULES = [
  {
    id: "ai-copilot",
    title: "Venture AI Copilot",
    badge: "NEURAL CORE",
    description: "An intelligent copilot trained on thousands of successful venture launches. Continuously analyzes your market position, spots architectural risks, and auto-generates technical documentation.",
    icon: Cpu,
    highlights: ["Context-aware decision engine", "Automated competitive intelligence", "24/7 technical copilot feedback"],
  },
  {
    id: "sprint-flight-deck",
    title: "7-Day Sprint Flight Deck",
    badge: "TIME-BOXED",
    description: "Scope creep is the #1 killer of early startups. FounderOS enforces strict 7-day flight sprints, breaking complex MVPs down into daily shippable micro-sprints.",
    icon: Zap,
    highlights: ["Scope-creep warning system", "Daily flight log checklists", "Integrated PR & Git telemetry"],
  },
  {
    id: "customer-radar",
    title: "Customer Validation Radar",
    badge: "PROBLEM SIGNAL",
    description: "Upload customer interview audio or notes. AI synthesizes pain points, extracts quantitative willingness-to-pay scores, and builds product requirement specs.",
    icon: Radar,
    highlights: ["Interview transcript parsing", "Willingness-to-pay heatmaps", "Feature request pain matrix"],
  },
  {
    id: "data-room",
    title: "Automated VC Data Room",
    badge: "INVESTOR DECK",
    description: "Generate a shareable investor data room in one click. Clean cap tables, unit economics calculators, live MRR telemetry graphs, and interactive pitch brief links.",
    icon: BarChart3,
    highlights: ["Live investor telemetry", "Cap table & runway projections", "Instant pitch brief export"],
  },
  {
    id: "tech-architect",
    title: "Architectural Blueprint Gen",
    badge: "STACK SCOPER",
    description: "Get instant tech stack recommendations tailored to your venture scope. Auto-generate database schemas, API specs, and auth configurations ready for deployment.",
    icon: Layers,
    highlights: ["Tailored DB schemas & API specs", "Zero-vendor lock-in", "Production boilerplate generators"],
  },
  {
    id: "command-console",
    title: "Traction & Investor Console",
    badge: "FOUNDER OS",
    description: "One central command console to orchestrate your startup growth. Track MRR growth, user retention, sprint execution velocity, and cap table updates in real time.",
    icon: Terminal,
    highlights: ["Single pane for all venture traction", "Customizable metric widgets", "Real-time investor reporting"],
  },
];

export const ModulesGrid: React.FC = () => {
  return (
    <section id="modules" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Soft background glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-glass-border bg-surface-container-low text-xs font-mono text-zinc-300">
          <Sparkles className="size-3.5 text-zinc-300" />
          <span>STARTUP OS APP MODULES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-headline-lg text-white tracking-tight">
          Engineered for Founders Who <br />
          <span className="text-gradient-neural">Refuse to Waste Time on Bloat</span>
        </h2>
        <p className="text-base text-on-surface-variant">
          Integrated application modules designed to take you from a blank screen to a market-ready venture.
        </p>
      </div>

      {/* 6 Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className="glass-card p-8 group flex flex-col justify-between rounded-xl relative overflow-hidden transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] hover:scale-[1.02]"
            >
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-xl bg-surface-container border border-glass-border text-zinc-300 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-all">
                    <Icon className="size-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-surface-container border border-glass-border text-primary font-medium">
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-headline-md text-white group-hover:text-zinc-300 transition-colors flex items-center gap-2">
                    <span>{mod.title}</span>
                    <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300" />
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <ul className="space-y-2 pt-2 border-t border-glass-border/40">
                  {mod.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-on-surface/90 font-mono">
                      <span className="size-1.5 rounded-full bg-tertiary" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-glass-border/40 flex items-center justify-between text-xs font-mono text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                <span>MODULE ACTIVE</span>
                <span className="text-tertiary">STATUS 100%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

