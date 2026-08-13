import React from "react";
import { Rocket, ShieldCheck, Star, Quote, Award } from "lucide-react";

const STATS = [
  { value: "1,240+", label: "VENTURES LAUNCHED", subtext: "Across 42 countries" },
  { value: "$420M+", label: "CAPITAL RAISED", subtext: "By FounderOS alumni" },
  { value: "6.8 Days", label: "AVG SPRINT LAUNCH", subtext: "From brief to live URL" },
  { value: "98.4%", label: "PITCH CLARITY INDEX", subtext: "Rated by tier-1 VCs" },
];

const REVIEWS = [
  {
    quote: "FounderOS gave us the clarity of Linear with the predictive intelligence of a top-tier incubator partner. We launched our core MVP in 6 days instead of 3 months.",
    author: "Alex Rivera",
    role: "Founder & CEO, Zenith AI",
    badge: "Y Combinator S24",
    avatar: "AR",
    metrics: "Raised $2.4M Seed"
  },
  {
    quote: "The 7-Day Sprint Flight Deck prevented our team from scope-creeping ourselves into exhaustion. It forced us to execute only what truly mattered to customers.",
    author: "Elena Rostova",
    role: "Co-Founder, Orbital Infrastructure",
    badge: "Techstars 2025",
    avatar: "ER",
    metrics: "$120k ARR in 30 Days"
  },
  {
    quote: "Stepping into FounderOS feels like opening a purpose-built operating system designed purely for entrepreneurs. The AI validation radar caught critical market flaws before we wasted $50k on wrong features.",
    author: "Marcus Vance",
    role: "Founder, Quantum Ledger",
    badge: "Sequoia Surge",
    avatar: "MV",
    metrics: "Acquired in 14 Months"
  }
];

export const TestimonialsAndMetrics: React.FC = () => {
  return (
    <section id="mission-logs" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-6 border border-white/10 bg-[#0b0f12]/90 backdrop-blur-xl text-center space-y-2 relative overflow-hidden group hover:border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-2xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#d4d4d8] to-transparent opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_#d4d4d8]" />
            <p className="text-3xl sm:text-4xl font-extrabold font-display text-zinc-300 tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              {stat.label}
            </p>
            <p className="text-[11px] text-[#958ea0]">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Testimonials Header */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-800/60 text-xs font-mono text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <Quote className="size-3.5 text-zinc-300" />
            <span>MISSION LOGS FROM ORBIT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Trusted by Founders Building <br />
            <span className="text-gradient-system">The Next Billion-Dollar Ventures</span>
          </h2>
        </div>

        {/* 3 Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.author}
              className="glass-card p-8 border border-white/10 bg-[#0b0f12] flex flex-col justify-between space-y-6 hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-2xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-zinc-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-current text-zinc-300 shadow-[0_0_6px_#d4d4d8]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-800/60 text-zinc-300 border border-white/10 font-bold">
                    {rev.badge}
                  </span>
                </div>
                <p className="text-sm text-[#cbc3d7] leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#101417] border border-white/10 flex items-center justify-center font-bold text-xs font-mono text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.author}</h4>
                    <p className="text-[11px] text-[#958ea0]">{rev.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-300 font-extrabold block">
                    {rev.metrics}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
