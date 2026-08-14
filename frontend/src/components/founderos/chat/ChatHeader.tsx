import React from "react";
import { Sparkles, Bot, Zap, Award, CheckCircle2, RotateCcw } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { deriveIdeaScore } from "@/lib/founderos/derive";
import { determineCurrentQuestionIndex } from "./mockAiEngine";

interface ChatHeaderProps {
  onOpenScore?: () => void;
  onClearChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenScore,
  onClearChat,
}) => {
  const { venture } = useActiveVenture();
  const isComplete = Boolean(
    venture?.validationState?.completed ||
    (venture?.validationState?.answers?.question1 &&
      venture?.validationState?.answers?.question2 &&
      venture?.validationState?.answers?.question3 &&
      venture?.validationState?.answers?.question4 &&
      venture?.validationState?.answers?.question5) ||
    (venture?.ideaScore && venture.ideaScore.overallScore > 0)
  );

  const ideaScore = venture ? deriveIdeaScore(venture) : null;
  const scoreVal = isComplete ? (ideaScore?.overallScore ?? 0) : 0;

  const currentQIndex = venture?.validationState
    ? (venture.validationState.completed ? 5 : Math.max(0, venture.validationState.currentQuestion - 1))
    : (venture?.chat ? determineCurrentQuestionIndex(venture.chat) : 0);

  return (
    <div className="sticky top-0 z-20 border-b border-[rgba(139,92,246,0.25)] bg-[#0b0f12]/95 backdrop-blur-2xl px-4 sm:px-8 py-3.5 sm:py-4 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.6)] w-full">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
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
                ? "5-Question validation completed and saved. Use the sidebar or button below to validate another idea."
                : "Validate your problem, alternatives, pain frequency, differentiation, and demand before building."}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Clear Chat / Validate Another Idea Button */}
          {onClearChat && (
            <button
              onClick={onClearChat}
              title="Clear current interview and start validating another idea"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.12)] hover:bg-[rgba(139,92,246,0.25)] px-3 py-1.5 text-xs font-bold text-[#A78BFA] hover:text-white transition hover:scale-[1.02] shadow-[0_0_15px_rgba(139,92,246,0.15)] cursor-pointer"
            >
              <RotateCcw className="size-3.5 text-[#A78BFA]" />
              <span>{isComplete ? "Validate Another Idea" : "Clear Chat"}</span>
            </button>
          )}

          {/* Score Button */}
          {onOpenScore ? (
            <button
              onClick={onOpenScore}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.15)] px-3 py-1.5 text-xs font-bold text-[#A78BFA] transition hover:bg-[rgba(139,92,246,0.25)] hover:scale-[1.02] shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer"
            >
              <Award className="size-3.5 sm:size-4 text-[#A78BFA]" />
              <span className="hidden xs:inline">Score:</span>
              <span className="font-mono text-white font-extrabold">{scoreVal}/100</span>
              <Sparkles className="size-3 text-[#A78BFA]" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};




