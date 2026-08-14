import React from "react";
import { Star, Quote, CheckCircle2, ArrowUpRight } from "lucide-react";

const STATS = [
  { value: "1,240+", label: "VENTURES LAUNCHED", subtext: "Across 42 countries" },
  { value: "$420M+", label: "CAPITAL RAISED", subtext: "By FounderOS alumni" },
  { value: "6.8 Days", label: "AVG SPRINT LAUNCH", subtext: "From brief to live URL" },
];

export const TestimonialsAndMetrics: React.FC = () => {
  return (
    <section id="mission-logs" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 sm:space-y-20 overflow-hidden">
      {/* Consolidated 3-Stat Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-6 sm:p-8 border border-[rgba(139,92,246,0.25)] bg-[#0b0f12]/90 backdrop-blur-xl text-center space-y-2 relative overflow-hidden group hover:border-[#A78BFA] shadow-[0_0_20px_rgba(139,92,246,0.1)] rounded-2xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-[#A78BFA] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#A78BFA] tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-xs text-[#958ea0]">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Testimonials Section */}
      <div className="space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-xs font-mono text-[#A78BFA]">
            <Quote className="size-3.5 text-[#A78BFA]" />
            <span>FOUNDER EXPERIENCES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight">
            Built by Founders, <span className="text-gradient-system">Validated in Production</span>
          </h2>
        </div>

        {/* Varied Testimonials: 1 Large Featured Pull-Quote + 2 Asymmetric Cards */}
        <div className="space-y-6">
          {/* Featured Wide Pull-Quote Card */}
          <div className="glass-card p-6 sm:p-10 lg:p-12 border border-[rgba(139,92,246,0.35)] bg-[#0b0f12] rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-1 text-[#A78BFA]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current text-[#A78BFA]" />
                  ))}
                </div>
                <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-white leading-snug">
                  "FounderOS cut our initial build from 3 months of debate down to a 7-day sprint. The AI validation radar caught critical market flaws before we wrote code, and we reached $120k ARR in 30 days."
                </blockquote>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-[#101417] border border-[rgba(139,92,246,0.4)] flex items-center justify-center font-bold text-sm font-mono text-[#A78BFA]">
                    ER
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Elena Rostova</h4>
                    <p className="text-xs text-[#958ea0]">Co-Founder, Orbital Infrastructure</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A78BFA] bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] px-3 py-1.5 rounded-xl w-fit">
                  <CheckCircle2 className="size-3.5" />
                  <span>$120k ARR in 30 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2 Asymmetric Supporting Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A - With Metric */}
            <div className="glass-card p-6 sm:p-8 border border-white/10 bg-[#0b0f12] rounded-2xl flex flex-col justify-between space-y-6 hover:border-[rgba(139,92,246,0.4)] transition-all">
              <p className="text-sm sm:text-base text-[#cbc3d7] leading-relaxed">
                "Having the AI Copilot interrogate our MVP assumptions gave us the confidence to drop 4 unnecessary features and focus purely on what users were ready to pay for."
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold text-white">Alex Rivera</h4>
                  <p className="text-xs text-[#958ea0]">Founder & CEO, Zenith AI</p>
                </div>
                <span className="text-xs font-mono text-[#A78BFA] px-2.5 py-1 rounded bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)]">
                  Raised $2.4M Seed
                </span>
              </div>
            </div>

            {/* Card B - Pure Founder Story (no metric badge) */}
            <div className="glass-card p-6 sm:p-8 border border-white/10 bg-[#0b0f12] rounded-2xl flex flex-col justify-between space-y-6 hover:border-[rgba(139,92,246,0.4)] transition-all">
              <p className="text-sm sm:text-base text-[#cbc3d7] leading-relaxed">
                "The one-click data room export made diligence seamless with angel investors. Everything from cap table projections to verified customer quotes was already in place."
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Vance</h4>
                  <p className="text-xs text-[#958ea0]">Founder, Quantum Ledger</p>
                </div>
                <span className="text-xs font-mono text-[#958ea0]">
                  Solo Founder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
