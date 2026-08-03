import React from "react";
import { Sparkles, Bot, ShieldCheck, Zap } from "lucide-react";

export const ChatHeader: React.FC = () => {
  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0E131C]/90 backdrop-blur-2xl px-6 py-4 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center size-11 rounded-2xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#64D8FF]/10 border border-[#4F8CFF]/40 text-[#4F8CFF] shadow-[0_0_20px_rgba(79,140,255,0.25)]">
            <Bot className="size-6 text-[#4F8CFF]" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[#46E3A3] border-2 border-[#0E131C] shadow-[0_0_8px_#46E3A3]" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold font-display tracking-tight text-[#F5F8FC]">
                FounderOS AI Founder Coach
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#46E3A3]/30 bg-[#46E3A3]/10 text-[11px] font-mono font-semibold text-[#46E3A3]">
                <Zap className="size-3" /> ONLINE
              </span>
            </div>
            <p className="text-xs text-[#A8B3C7] mt-0.5">
              Talk naturally about your startup. I'll build your venture brief while we chat.
            </p>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-[#161F2D]/80 text-xs font-mono text-[#A8B3C7]">
          <ShieldCheck className="size-4 text-[#4F8CFF]" />
          <span>Continuous Context Active</span>
        </div>
      </div>
    </div>
  );
};
