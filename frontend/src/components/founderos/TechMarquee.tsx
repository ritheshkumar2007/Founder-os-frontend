import React from "react";
import { Sparkles, ShieldCheck, Zap, Layers, Rocket, Command, Cpu } from "lucide-react";

const PARTNERS = [
  { name: "Y COMBINATOR S24", role: "Alumni Batch", icon: Rocket },
  { name: "SEQUOIA SURGE", role: "Venture Partner", icon: ShieldCheck },
  { name: "FOUNDERS FUND", role: "Seed Cohort", icon: Zap },
  { name: "TECHSTARS 2025", role: "Accelerator", icon: Sparkles },
  { name: "ACCEL CAPITAL", role: "Lead Investor", icon: Layers },
  { name: "A16Z SPEEDRUN", role: "Portfolio", icon: Command },
  { name: "VERCEL PLATFORM", role: "Infrastructure", icon: Cpu },
  { name: "STRIPE VENTURES", role: "Billing Core", icon: ShieldCheck },
  { name: "LINEAR WORKSPACE", role: "Design Partner", icon: Zap },
  { name: "GITHUB FOR STARTUPS", role: "Dev Suite", icon: Sparkles },
];

export const TechMarquee: React.FC = () => {
  return (
    <section className="relative py-12 border-y border-[rgba(139,92,246,0.2)] bg-[#020408] overflow-hidden z-10">
      {/* Title */}
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-[#958ea0] uppercase tracking-[0.25em]">
          POWERING THE NEXT GENERATION OF HIGH-TRACTION VENTURES
        </p>
      </div>

      {/* Infinite Marquee Container with Gradient Fading Mask */}
      <div className="marquee-mask relative w-full overflow-hidden">
        <div className="flex w-max items-center gap-6 animate-marquee">
          {/* Double array for seamless loop */}
          {[...PARTNERS, ...PARTNERS].map((partner, index) => {
            const Icon = partner.icon;
            return (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-[#0b0f12] backdrop-blur-md text-xs font-mono transition-all hover:border-[rgba(139,92,246,0.4)] hover:bg-[#101417]"
              >
                <Icon className="size-4 text-[#A78BFA]" />
                <span className="font-bold text-white tracking-wider">{partner.name}</span>
                <span className="text-white/20">•</span>
                <span className="text-[#cbc3d7] text-[11px]">{partner.role}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
