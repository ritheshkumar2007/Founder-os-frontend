import React from "react";
import { Sparkles, Bot, ShieldCheck, Zap, FileText, Kanban, TrendingUp, Award } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { deriveIdeaScore } from "@/lib/founderos/derive";

interface ChatHeaderProps {
  onOpenReports?: () => void;
  onOpenExecution?: () => void;
  onOpenGrowth?: () => void;
  onOpenScore?: () => void;
  latestReports?: any[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenReports,
  onOpenExecution,
  onOpenGrowth,
  onOpenScore,
}) => {
  const { venture } = useActiveVenture();
  const ideaScore = venture ? deriveIdeaScore(venture) : null;
  const scoreVal = ideaScore?.overallScore ?? 0;

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f12]/90 backdrop-blur-2xl px-6 py-4 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center size-11 rounded-2xl bg-zinc-800/60 border border-white/10 text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <Bot className="size-6 text-zinc-300" />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-zinc-800 border-2 border-[#0b0f12] shadow-[0_0_8px_#d4d4d8]" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold font-display tracking-tight text-white">
                FounderOS AI Founder Coach
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/10 bg-zinc-800/60 text-[11px] font-mono font-semibold text-zinc-300">
                <Zap className="size-3" /> ONLINE
              </span>
            </div>
            <p className="text-xs text-[#cbc3d7] mt-0.5">
              Talk naturally about your startup. I'll build your venture brief while we chat.
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {onOpenScore ? (
            <button
              onClick={onOpenScore}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-800/60 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-800/60 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <Award className="size-4 text-zinc-300" />
              <span>Score:</span>
              <span className="font-mono text-white font-extrabold">{scoreVal}/100</span>
              <Sparkles className="size-3 text-zinc-300" />
            </button>
          ) : null}

          {onOpenGrowth ? (
            <button
              onClick={onOpenGrowth}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#101417] px-3 py-1.5 text-xs font-bold text-[#cbc3d7] hover:text-white transition hover:bg-zinc-800/60 hover:border-white/30 hover:scale-[1.02] cursor-pointer"
            >
              <TrendingUp className="size-4 text-zinc-300" />
              <span>Growth OS</span>
            </button>
          ) : null}

          {onOpenExecution ? (
            <button
              onClick={onOpenExecution}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#101417] px-3 py-1.5 text-xs font-bold text-[#cbc3d7] hover:text-white transition hover:bg-zinc-800/60 hover:border-white/30 hover:scale-[1.02] cursor-pointer"
            >
              <Kanban className="size-4 text-zinc-300" />
              <span>Execution OS</span>
            </button>
          ) : null}

          {onOpenReports ? (
            <button
              onClick={onOpenReports}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#101417] px-3 py-1.5 text-xs font-bold text-[#cbc3d7] hover:text-white transition hover:bg-zinc-800/60 hover:border-white/30 hover:scale-[1.02] cursor-pointer"
            >
              <FileText className="size-4 text-zinc-300" />
              <span>Reports</span>
            </button>
          ) : null}

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-[#101417] text-xs font-mono text-[#958ea0]">
            <ShieldCheck className="size-4 text-zinc-300" />
            <span>AI Context Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};




