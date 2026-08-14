import React, { useState } from "react";
import {
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CreditCard,
  Rocket,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { deriveIdeaScore } from "@/lib/founderos/derive";
import type { IdeaScore, ScorePillar } from "@/lib/founderos/types";
import api from "@/lib/api";

interface IdeaScoreModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateToInterviews?: () => void;
}

export const IdeaScoreModal: React.FC<IdeaScoreModalProps> = ({
  open,
  onClose,
  onNavigateToInterviews,
}) => {
  const { venture, update } = useActiveVenture();
  const [recalculating, setRecalculating] = useState(false);

  if (!open || !venture) return null;

  const currentScore: IdeaScore = deriveIdeaScore(venture);

  const handleRecalculate = async () => {
    if (!venture?.id || recalculating) return;
    setRecalculating(true);
    try {
      const res = await api.calculateIdeaScore(venture.id);
      if (res.success && res.data?.ideaScore) {
        update((v) => ({
          ...v,
          ideaScore: res.data.ideaScore,
        }));
      } else {
        // Fallback local re-evaluation
        const newScore = deriveIdeaScore(venture);
        update((v) => ({
          ...v,
          ideaScore: newScore,
        }));
      }
    } catch {
      const newScore = deriveIdeaScore(venture);
      update((v) => ({
        ...v,
        ideaScore: newScore,
      }));
    } finally {
      setRecalculating(false);
    }
  };

  const getTierColor = (tier: string, score: number) => {
    if (score >= 85 || tier === "Exceptional") {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        stroke: "stroke-emerald-500",
        gradient: "from-emerald-500 to-teal-400",
      };
    }
    if (score >= 70 || tier === "Promising") {
      return {
        text: "text-cyan-400",
        bg: "bg-cyan-500/10 border-cyan-500/30",
        stroke: "stroke-cyan-500",
        gradient: "from-cyan-500 to-blue-500",
      };
    }
    if (score >= 50 || tier === "Early Stage") {
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/30",
        stroke: "stroke-amber-500",
        gradient: "from-amber-500 to-yellow-400",
      };
    }
    return {
      text: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30",
      stroke: "stroke-rose-500",
      gradient: "from-rose-500 to-red-500",
    };
  };

  const colors = getTierColor(currentScore.tier, currentScore.overallScore);
  const interviewCount = Array.isArray(venture.interviews) ? venture.interviews.length : 0;

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, currentScore.overallScore)) / 100) * circumference;

  const renderPillarBar = (
    label: string,
    pillar: ScorePillar,
    icon: React.ReactNode,
    colorClass: string
  ) => {
    const percentage = Math.round((pillar.score / pillar.max) * 100);
    return (
      <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 backdrop-blur-sm transition-all hover:border-white/[0.15]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-white/90">
            <span className="p-1 rounded-md bg-white/[0.05]">{icon}</span>
            <span>{label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-white">{pillar.score}</span>
            <span className="text-white/40">/ {pillar.max} pts</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {pillar.reasoning ? (
          <p className="mt-2 text-[11px] leading-relaxed text-white/60">
            {pillar.reasoning}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90dvh] overflow-hidden rounded-2xl border border-white/[0.12] bg-zinc-950/95 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.02] gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shrink-0">
              <Award className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2 truncate">
                100-Point Viability Score
              </h2>
              <p className="text-[10px] sm:text-xs text-white/50 truncate">
                5-Pillar validation benchmark & AI pressure test
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden xs:inline">{recalculating ? "Evaluating..." : "Re-Calculate"}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6">
          {/* Hero Gauge & Tier Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-4 sm:p-5">
            {/* Radial Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.08] pb-4 md:pb-0 md:pr-4">
              <div className="relative flex items-center justify-center">
                <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-white/[0.08]"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className={`${colors.stroke} transition-all duration-700 ease-out`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold tracking-tight text-white">
                    {currentScore.overallScore}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                    out of 100
                  </span>
                </div>
              </div>

              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold border ${colors.bg} ${colors.text}`}>
                <Sparkles className="h-3 w-3" />
                {currentScore.tier}
              </div>
            </div>

            {/* Assessment Narrative */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-white/90">
                  Validation Verdict for "{venture.name || "Your Venture"}"
                </h3>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">
                  {currentScore.overallScore >= 85
                    ? "Exceptional validation indicators across all 5 dimensions. Real customer feedback confirms high pain, active workarounds, and commercial willingness to pay."
                    : currentScore.overallScore >= 70
                    ? "Promising commercial signal detected. Core pain is acknowledged by target users. Focus on accelerating customer interviews and testing pricing."
                    : currentScore.overallScore >= 50
                    ? "Early-stage concept with strong foundational assumptions. Conduct 3+ customer discovery interviews to substantiate problem urgency."
                    : "High risk of building without validated demand. Revisit your target audience and interview 3-5 users experiencing high daily friction."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <div className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2.5 py-1 text-white/70 border border-white/[0.06]">
                  <TrendingUp className="h-3 w-3 text-indigo-400" />
                  <span>
                    Interview Multiplier:{" "}
                    <strong className="text-white font-mono">{currentScore.interviewMultiplier}x</strong>
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2.5 py-1 text-white/70 border border-white/[0.06]">
                  <Rocket className="h-3 w-3 text-cyan-400" />
                  <span>
                    Interviews Logged: <strong className="text-white font-mono">{interviewCount}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Pillar Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                5-Pillar Validation Breakdown (100 Points Total)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderPillarBar(
                "1. Problem Clarity",
                currentScore.pillars.problemSeverity,
                <Flame className="h-4 w-4 text-orange-400" />,
                "bg-orange-500"
              )}
              {renderPillarBar(
                "2. Alternatives Understanding",
                currentScore.pillars.willingnessToPay,
                <CreditCard className="h-4 w-4 text-emerald-400" />,
                "bg-emerald-500"
              )}
              {renderPillarBar(
                "3. Pain Frequency & Intensity",
                currentScore.pillars.distribution,
                <Rocket className="h-4 w-4 text-sky-400" />,
                "bg-sky-500"
              )}
              {renderPillarBar(
                "4. Differentiation & Wedge",
                currentScore.pillars.unfairAdvantage,
                <ShieldCheck className="h-4 w-4 text-purple-400" />,
                "bg-purple-500"
              )}
              <div className="sm:col-span-2">
                {renderPillarBar(
                  "5. Evidence of Demand",
                  currentScore.pillars.executionSpeed,
                  <Zap className="h-4 w-4 text-amber-400" />,
                  "bg-amber-500"
                )}
              </div>
            </div>
          </div>

          {/* Green Flags & Blindspots (Risks) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths / Green Flags */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
              <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Validated Strengths (Green Flags)
              </h4>
              <ul className="mt-2.5 space-y-2">
                {currentScore.strengths && currentScore.strengths.length > 0 ? (
                  currentScore.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-white/50 italic">
                    Complete your venture brief to unlock strengths.
                  </li>
                )}
              </ul>
            </div>

            {/* Critical Blind Spots / Risks */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-4">
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Critical Risks & Blind Spots
              </h4>
              <ul className="mt-2.5 space-y-2">
                {currentScore.risks && currentScore.risks.length > 0 ? (
                  currentScore.risks.map((risk, idx) => (
                    <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-white/50 italic">
                    No critical red flags detected.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Action Plan: How to Raise Your Score */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
            <h4 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Action Plan: How to Boost Your Score
            </h4>
            <div className="mt-3 space-y-2">
              {currentScore.recommendations && currentScore.recommendations.length > 0 ? (
                currentScore.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-black/40 border border-white/[0.06] p-2.5 text-xs text-white/90"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                    {onNavigateToInterviews && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToInterviews();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Action <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-6 py-3.5 bg-white/[0.02] flex items-center justify-between">
          <p className="text-[11px] text-white/40">
            Last evaluated: {new Date(currentScore.lastCalculatedAt || Date.now()).toLocaleDateString()}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-white/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
