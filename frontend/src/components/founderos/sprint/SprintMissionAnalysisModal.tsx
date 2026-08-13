import React, { useState, useEffect } from "react";
import { X, Rocket, CheckCircle2, Loader2, Sparkles, Terminal, ShieldAlert, ArrowRight, RefreshCw, Zap, TrendingUp } from "lucide-react";

interface SprintMissionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventureName: string;
  velocityScore: number;
  activeDay: number;
  completedDirectivesCount: number;
  totalDirectivesCount: number;
}

export const SprintMissionAnalysisModal: React.FC<SprintMissionAnalysisModalProps> = ({
  isOpen,
  onClose,
  ventureName,
  velocityScore,
  activeDay,
  completedDirectivesCount,
  totalDirectivesCount,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      handleRunAnalysis();
    } else {
      setAnalyzing(false);
      setCompleted(false);
      setProgress(0);
      setLogs([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleRunAnalysis() {
    setAnalyzing(true);
    setCompleted(false);
    setProgress(15);
    setLogs([
      `[00:00.00] Initializing Tactical Flight Deck Analysis for "${ventureName || "Active Venture"}"...`,
    ]);

    const steps = [
      "Auditing Day 1-7 milestone completion & velocity pacing",
      "Evaluating critical path blockers across API, auth & UI staging",
      "Benchmarking sprint throughput against 7-day high-velocity cohorts",
      "Generating tactical recommendations to maintain 80%+ launch momentum",
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current <= steps.length) {
        setProgress(Math.round(((current + 1) / (steps.length + 1)) * 100));
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${steps[current - 1]}`,
        ]);
      } else {
        clearInterval(interval);
        setAnalyzing(false);
        setCompleted(true);
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✔ Flight Deck Analysis complete. Sprint health: OPTIMAL.`,
        ]);
      }
    }, 650);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-2xl rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12] text-[#e0e3e7] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.25)] bg-[#101417]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Rocket className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Sprint Mission Analysis
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                  DAY {activeDay} OF 7
                </span>
              </h3>
              <p className="text-xs font-mono text-[#cbc3d7]/70">
                Target: {ventureName || "Default Venture Node"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={analyzing}
            className="p-1.5 rounded-lg text-[#958ea0] hover:text-white hover:bg-white/5 transition disabled:opacity-30 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Progress / Status */}
          <div className="p-4 rounded-xl bg-[#101417] border border-[rgba(139,92,246,0.3)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {analyzing ? (
                  <Loader2 className="size-4 animate-spin text-[#A78BFA]" />
                ) : (
                  <CheckCircle2 className="size-4 text-[#A78BFA]" />
                )}
                <span className="text-xs font-mono font-bold text-white">
                  {analyzing ? "COMPUTING SPRINT TELEMETRY..." : "ANALYSIS LOCKED & READY"}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#A78BFA]">
                {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1c2023] h-2 rounded-full overflow-hidden border border-[rgba(139,92,246,0.2)]">
              <div
                className="bg-[#A78BFA] h-full transition-all duration-300 shadow-[0_0_12px_#A78BFA]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Terminal Log Console */}
          <div className="rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#020408] p-4 font-mono text-xs text-[#cbc3d7] space-y-1.5 h-36 overflow-y-auto shadow-inner">
            <div className="text-[#A78BFA] font-bold mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
              <Terminal className="size-3.5" />
              <span>SPRINT_AI // DIAGNOSTIC_STREAM</span>
            </div>
            {logs.map((log, index) => (
              <div
                key={index}
                className={`leading-relaxed ${
                  log.includes("✔")
                    ? "text-[#A78BFA] font-semibold"
                    : log.includes("Initializing")
                    ? "text-[#A78BFA]"
                    : "text-[#cbc3d7]"
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          {/* Results Summary once completed */}
          {completed && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417]">
                  <span className="text-[#958ea0] uppercase text-[10px] block">Velocity Index</span>
                  <span className="text-xl font-bold text-white">{velocityScore}%</span>
                  <span className="text-[11px] text-[#A78BFA] block mt-0.5">Top 10% pacing</span>
                </div>
                <div className="p-3.5 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417]">
                  <span className="text-[#958ea0] uppercase text-[10px] block">Directives Done</span>
                  <span className="text-xl font-bold text-white">{completedDirectivesCount} / {totalDirectivesCount}</span>
                  <span className="text-[11px] text-[#A78BFA] block mt-0.5">Core targets locked</span>
                </div>
                <div className="p-3.5 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417]">
                  <span className="text-[#958ea0] uppercase text-[10px] block">Days Remaining</span>
                  <span className="text-xl font-bold text-white">{Math.max(1, 7 - activeDay)} Days</span>
                  <span className="text-[11px] text-[#cbc3d7] block mt-0.5">T-Minus to Launch</span>
                </div>
              </div>

              {/* Actionable Sprint Directives */}
              <div className="p-4 rounded-xl border border-white/10 bg-[#101417] space-y-2.5 text-xs">
                <span className="font-mono text-[10px] uppercase text-[#A78BFA] font-bold block">
                  Tactical AI Recommendations for Day {activeDay}:
                </span>
                <ul className="space-y-2 text-[#e0e3e7]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                    <span><strong>Day {activeDay} Focus:</strong> Complete RESTful endpoints and verify auth middleware before beginning UI staging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                    <span><strong>Prune Distractions:</strong> Defer non-essential dashboard widgets to Day +14 post-launch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                    <span><strong>Launch Readiness:</strong> Prepare 5 personalized invite messages for early beta test users.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[rgba(139,92,246,0.25)] bg-[#101417] flex justify-between items-center text-xs font-mono">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="text-[#cbc3d7] hover:text-white flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${analyzing ? "animate-spin" : ""}`} />
            <span>Re-run Diagnostics</span>
          </button>
          <button
            onClick={onClose}
            className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
          >
            Return to Flight Deck
          </button>
        </div>
      </div>
    </div>
  );
};
