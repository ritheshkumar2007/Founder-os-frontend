import React from "react";
import { Cpu, Zap, BarChart3, Radar, Layers, ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";

export const ModulesGrid: React.FC = () => {
  return (
    <section id="modules" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Soft background glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-electric-violet/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header - Left-aligned for visual variety */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 relative z-10">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-surface-container-low text-xs font-mono text-electric-violet">
            <Sparkles className="size-3.5 text-electric-violet" />
            <span>CORE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-headline-lg text-white tracking-tight">
            Every Tool Needed to <br />
            <span className="text-gradient-neural">Validate, Build, and Launch</span>
          </h2>
        </div>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-md">
          Zero bloat. Each module solves one concrete bottleneck in the startup lifecycle.
        </p>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-10">
        {/* Bento Item 1: Wide Featured Card - AI Copilot */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl md:col-span-2 lg:col-span-2 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] hover:border-[rgba(139,92,246,0.4)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-xl bg-surface-container border border-glass-border text-electric-violet flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                <Cpu className="size-6 text-[#A78BFA]" />
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#A78BFA] font-semibold">
                ALWAYS-ON ADVISOR
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-headline-md text-white flex items-center gap-2">
                <span>FounderOS AI Copilot</span>
                <ArrowUpRight className="size-5 text-[#A78BFA]" />
              </h3>
              <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
                An embedded ops officer with persistent memory across your validation data, code scope, sprint logs, and investor metrics. Spots assumptions and keeps your team focused on shippable momentum.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-white/5 bg-[#101417] space-y-1">
                <p className="text-[10px] font-mono text-[#958ea0]">INTERACTION</p>
                <p className="text-xs font-semibold text-white">Direct & High-Signal</p>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-[#101417] space-y-1">
                <p className="text-[10px] font-mono text-[#958ea0]">MEMORY DEPTH</p>
                <p className="text-xs font-semibold text-white">Full Startup Context</p>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-[#101417] space-y-1">
                <p className="text-[10px] font-mono text-[#958ea0]">DELIVERABLE</p>
                <p className="text-xs font-semibold text-[#A78BFA]">100-Point Viability Index</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-glass-border/40 flex items-center justify-between text-xs font-mono text-[#cbc3d7]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-[#A78BFA]" /> Context synchronized across 5 stages
            </span>
          </div>
        </div>

        {/* Bento Item 2: Problem Radar */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] hover:border-[rgba(139,92,246,0.4)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-xl bg-surface-container border border-glass-border text-electric-violet flex items-center justify-center">
                <Radar className="size-5 text-[#A78BFA]" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-surface-container border border-glass-border text-[#cbc3d7]">
                VALIDATION
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-headline-md text-white">Problem Radar</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Parse customer interview notes to extract willingness-to-pay and verify urgency before writing code.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-glass-border/40 text-xs font-mono text-[#cbc3d7]">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Interview pain-intensity scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Willingness-to-pay curves</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-glass-border/40 text-[11px] font-mono text-[#958ea0]">
            Output: Customer Signal Matrix
          </div>
        </div>

        {/* Bento Item 3: Precision MVP Scope */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] hover:border-[rgba(139,92,246,0.4)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-xl bg-surface-container border border-glass-border text-electric-violet flex items-center justify-center">
                <Layers className="size-5 text-[#A78BFA]" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-surface-container border border-glass-border text-[#cbc3d7]">
                ARCHITECTURE
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-headline-md text-white">Precision MVP Scope</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Scope the smallest buildable slice that solves the core problem. Auto-generate schemas and API specs.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-glass-border/40 text-xs font-mono text-[#cbc3d7]">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Strict feature cut recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Database & auth boilerplate</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-glass-border/40 text-[11px] font-mono text-[#958ea0]">
            Output: Zero-Bloat Spec Sheet
          </div>
        </div>

        {/* Bento Item 4: 7-Day Sprint */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] hover:border-[rgba(139,92,246,0.4)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-xl bg-surface-container border border-glass-border text-electric-violet flex items-center justify-center">
                <Zap className="size-5 text-[#A78BFA]" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-surface-container border border-glass-border text-[#cbc3d7]">
                EXECUTION
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-headline-md text-white">7-Day Build Sprint</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Enforce daily micro-sprints with built-in scope-creep protection to ship working software in one week.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-glass-border/40 text-xs font-mono text-[#cbc3d7]">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Day-by-day milestone checklists</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Scope-creep warning alerts</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-glass-border/40 text-[11px] font-mono text-[#958ea0]">
            Cadence: 7-Day Live Launch
          </div>
        </div>

        {/* Bento Item 5: Data Room & Traction */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 shadow-[0_15px_40px_rgba(2,4,10,0.8)] hover:border-[rgba(139,92,246,0.4)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-xl bg-surface-container border border-glass-border text-electric-violet flex items-center justify-center">
                <BarChart3 className="size-5 text-[#A78BFA]" />
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-surface-container border border-glass-border text-[#cbc3d7]">
                INVESTOR READINESS
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-headline-md text-white">Investor Data Room</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Generate clean cap tables, runway projections, and shareable pitch brief links for diligence in one click.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-glass-border/40 text-xs font-mono text-[#cbc3d7]">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>Live MRR & retention tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#A78BFA]" />
                <span>One-click pitch brief export</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-glass-border/40 text-[11px] font-mono text-[#958ea0]">
            Export: Shareable Diligence Vault
          </div>
        </div>
      </div>
    </section>
  );
};

