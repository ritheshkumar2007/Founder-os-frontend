import React from "react";
import { Sparkles, ShieldCheck, Zap, Layers, Command, Cpu, GitBranch, Database, CreditCard, Activity } from "lucide-react";

const INTEGRATIONS = [
  { name: "GITHUB", role: "Repo & PR Sync", icon: GitBranch },
  { name: "STRIPE", role: "Billing & Subscriptions", icon: CreditCard },
  { name: "LINEAR", role: "Issue & Sprint Tracking", icon: Zap },
  { name: "POSTHOG", role: "Product Telemetry", icon: Activity },
  { name: "VERCEL", role: "Edge Deployment", icon: Cpu },
  { name: "SUPABASE", role: "Database & Auth", icon: Database },
  { name: "RESEND", role: "Transactional Email", icon: Sparkles },
  { name: "OPENAI / GEMINI", role: "LLM Orchestration", icon: Command },
];

export const TechMarquee: React.FC = () => {
  return (
    <section className="relative py-10 border-y border-[rgba(139,92,246,0.2)] bg-[#020408] overflow-hidden z-10">
      {/* Title */}
      <div className="text-center mb-6">
        <p className="text-[11px] font-mono text-[#958ea0] uppercase tracking-[0.25em]">
          CONNECTS SEAMLESSLY WITH YOUR STARTUP STACK
        </p>
      </div>

      {/* Infinite Marquee Container with Gradient Fading Mask */}
      <div className="marquee-mask relative w-full overflow-hidden">
        <div className="flex w-max items-center gap-6 animate-marquee">
          {/* Double array for seamless loop */}
          {[...INTEGRATIONS, ...INTEGRATIONS].map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={`${tool.name}-${index}`}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-[#0b0f12] backdrop-blur-md text-xs font-mono transition-all hover:border-[rgba(139,92,246,0.4)] hover:bg-[#101417]"
              >
                <Icon className="size-4 text-[#A78BFA]" />
                <span className="font-bold text-white tracking-wider">{tool.name}</span>
                <span className="text-white/20">•</span>
                <span className="text-[#cbc3d7] text-[11px]">{tool.role}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
