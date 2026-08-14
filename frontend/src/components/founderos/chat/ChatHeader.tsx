import React from "react";
import { Sparkles, Bot, ShieldCheck, Zap, FileText, Kanban, TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { deriveIdeaScore } from "@/lib/founderos/derive";
import { determineCurrentQuestionIndex } from "./mockAiEngine";

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

  const currentQIndex = venture?.chat ? determineCurrentQuestionIndex(venture.chat) : 0;
  const isComplete = currentQIndex >= 5;

  return (
    <div className="sticky top-0 z-20 border-b border-[rgba(139,92,246,0.25)] bg-[#0b0f12]/95 backdrop-blur-2xl px-3.5 sm:px-6 py-3 sm:py-4 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#A78BFA] shadow-[0_0_20px_rgba(139,92,246,0.25)] shrink-0">
            <Bot className="size-5 sm:size-6 text-[#A78BFA]" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 sm:size-3 rounded-full bg-[#A78BFA] border-2 border-[#0b0f12] shadow-[0_0_8px_#A78BFA]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-white truncate">
                Idea Validation Coach
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.15)] text-[10px] sm:text-[11px] font-mono font-semibold text-[#A78BFA] shrink-0">
                {isComplete ? (
                  <>
                    <CheckCircle2 className="size-2.5 sm:size-3" /> VALIDATED
                  </>
                ) : (
                  <>
                    <Zap className="size-2.5 sm:size-3" /> QUESTION {Math.min(5, currentQIndex + 1)} OF 5
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#cbc3d7] mt-0.5 truncate">
              {isComplete
                ? "5-Question validation complete. Review your scorecard or proceed to MVP Scoping."
                : "Validate your problem, alternatives, pain frequency, differentiation, and demand before building."}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto">
          {onOpenScore ? (
            <button
              onClick={onOpenScore}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.15)] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#A78BFA] transition hover:bg-[rgba(139,92,246,0.25)] hover:scale-[1.02] shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer"
            >
              <Award className="size-3.5 sm:size-4 text-[#A78BFA]" />
              <span className="hidden xs:inline">Score:</span>
              <span className="font-mono text-white font-extrabold">{scoreVal}/100</span>
              <Sparkles className="size-3 text-[#A78BFA]" />
            </button>
          ) : null}

          {onOpenGrowth ? (
            <button
              onClick={onOpenGrowth}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#cbc3d7] hover:text-white transition hover:bg-[rgba(139,92,246,0.15)] hover:border-[#A78BFA] hover:scale-[1.02] cursor-pointer"
            >
              <TrendingUp className="size-3.5 sm:size-4 text-[#A78BFA]" />
              <span>Growth OS</span>
            </button>
          ) : null}

          {onOpenExecution ? (
            <button
              onClick={onOpenExecution}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#cbc3d7] hover:text-white transition hover:bg-[rgba(139,92,246,0.15)] hover:border-[#A78BFA] hover:scale-[1.02] cursor-pointer"
            >
              <Kanban className="size-3.5 sm:size-4 text-[#A78BFA]" />
              <span>Execution OS</span>
            </button>
          ) : null}

          {onOpenReports ? (
            <button
              onClick={onOpenReports}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#cbc3d7] hover:text-white transition hover:bg-[rgba(139,92,246,0.15)] hover:border-[#A78BFA] hover:scale-[1.02] cursor-pointer"
            >
              <FileText className="size-3.5 sm:size-4 text-[#A78BFA]" />
              <span>Reports</span>
            </button>
          ) : null}

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-[#101417] text-xs font-mono text-[#958ea0]">
            <ShieldCheck className="size-4 text-[#A78BFA]" />
            <span>AI Context Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};




