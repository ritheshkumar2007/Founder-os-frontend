import React from "react";
import { Sparkles, Bot, ShieldCheck, Zap, FileText, Kanban, TrendingUp } from "lucide-react";

interface ChatHeaderProps {
  onOpenReports?: () => void;
  onOpenExecution?: () => void;
  onOpenGrowth?: () => void;
  latestReports?: any[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenReports, onOpenExecution, onOpenGrowth }) => {
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

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {onOpenGrowth ? (
            <button
              onClick={onOpenGrowth}
              className="inline-flex items-center gap-2 rounded-xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 px-3.5 py-1.5 text-xs font-bold text-[#4F8CFF] transition hover:bg-[#4F8CFF]/20 hover:scale-[1.02] shadow-[0_0_15px_rgba(79,140,255,0.2)]"
            >
              <TrendingUp className="size-4 text-[#4F8CFF]" />
              <span>Growth OS</span>
            </button>
          ) : null}

          {onOpenExecution ? (
            <button
              onClick={onOpenExecution}
              className="inline-flex items-center gap-2 rounded-xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 px-3.5 py-1.5 text-xs font-bold text-[#46E3A3] transition hover:bg-[#46E3A3]/20 hover:scale-[1.02] shadow-[0_0_15px_rgba(70,227,163,0.2)]"
            >
              <Kanban className="size-4 text-[#46E3A3]" />
              <span>Execution OS</span>
            </button>
          ) : null}

          {onOpenReports ? (
            <button
              onClick={onOpenReports}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 px-3.5 py-1.5 text-xs font-bold text-[#64D8FF] transition hover:bg-[#64D8FF]/20 hover:scale-[1.02] shadow-[0_0_15px_rgba(100,216,255,0.2)]"
            >
              <FileText className="size-4 text-[#64D8FF]" />
              <span>AI Reports</span>
              <Sparkles className="size-3 text-[#64D8FF]" />
            </button>
          ) : null}

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-[#161F2D]/80 text-xs font-mono text-[#A8B3C7]">
            <ShieldCheck className="size-4 text-[#4F8CFF]" />
            <span>Continuous Context Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};



