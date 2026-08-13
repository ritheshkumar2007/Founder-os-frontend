import React, { useState, useEffect } from "react";
import { X, Play, CheckCircle2, Loader2, Zap, Terminal } from "lucide-react";

interface ProtocolExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventureName: string;
  onProtocolComplete?: (result: any) => void;
}

interface ProtocolOption {
  id: string;
  title: string;
  code: string;
  description: string;
  icon: string;
  duration: number; // in seconds
  steps: string[];
}

const PROTOCOLS: ProtocolOption[] = [
  {
    id: "full-diagnostic",
    title: "Neural Vector Alignment & Full TAM Audit",
    code: "PROTOCOL_ALPHA_01",
    description: "Deep scan customer pain points, cross-reference whitespace against 40+ competitor matrices, and synthesize validation certainty.",
    icon: "radar",
    duration: 3.5,
    steps: [
      "Establishing neural vector lock on customer problem statement",
      "Scanning Reddit, HackerNews & ProductHunt signal archives",
      "Synthesizing competitive differentiation matrix",
      "Calibrating Willingness-to-Pay index & TAM valuation",
      "Mission parameters confirmed: Readiness score updated to 96/100",
    ],
  },
  {
    id: "prototype-synth",
    title: "Rapid MVP Scope & Architecture Synthesis",
    code: "PROTOCOL_BETA_02",
    description: "Convert validated market friction into a minimal viable product spec with 7-day deployment milestones.",
    icon: "architecture",
    duration: 3.0,
    steps: [
      "Ingesting top 3 customer workflow blockers",
      "Pruning non-essential feature requests to achieve day-7 flight readiness",
      "Generating high-velocity database schema & auth blueprint",
      "Locking sprint roadmap milestones into FounderOS engine",
    ],
  },
  {
    id: "investor-sweep",
    title: "Venture Velocity & Investor Readiness Sweep",
    code: "PROTOCOL_GAMMA_03",
    description: "Aggregate traction metrics, monthly runway, and customer validation signals into an institutional-grade brief.",
    icon: "monitoring",
    duration: 3.2,
    steps: [
      "Auditing traction funnel conversion rates",
      "Benchmarking unit economics against top 5% YC/SaaS cohorts",
      "Generating automated investor update briefing document",
      "Readiness certification issued for Seed/Pre-Seed rounds",
    ],
  },
];

export const ProtocolExecutionModal: React.FC<ProtocolExecutionModalProps> = ({
  isOpen,
  onClose,
  ventureName,
  onProtocolComplete,
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string>(PROTOCOLS[0].id);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setCurrentStepIndex(0);
      setProgress(0);
      setLogs([]);
      setIsCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProtocol = PROTOCOLS.find((p) => p.id === selectedProtocol) || PROTOCOLS[0];

  const handleStartProtocol = () => {
    setIsRunning(true);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setProgress(0);
    setLogs([`[00:00.00] Initializing ${currentProtocol.code} for "${ventureName || "Active Venture"}"...`]);

    const stepCount = currentProtocol.steps.length;
    const intervalTime = (currentProtocol.duration * 1000) / stepCount;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= stepCount) {
        const stepText = currentProtocol.steps[step - 1];
        setCurrentStepIndex(step - 1);
        setProgress(Math.round((step / stepCount) * 100));
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${stepText}`,
        ]);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setIsCompleted(true);
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✔ Protocol execution completed with 0 errors. All telemetry systems synchronized.`,
        ]);
        onProtocolComplete?.({
          protocolId: currentProtocol.id,
          timestamp: new Date().toISOString(),
        });
      }
    }, intervalTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-2xl rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12] text-[#e0e3e7] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.25)] bg-[#101417]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Zap className="size-5 fill-current" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Mission Protocol Execution
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                  ARMED & READY
                </span>
              </h3>
              <p className="text-xs font-mono text-[#cbc3d7]/70">
                Target: {ventureName || "Default Venture Node"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-[#958ea0] hover:text-white hover:bg-white/5 transition disabled:opacity-30"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {!isRunning && !isCompleted ? (
            <>
              {/* Protocol Select Cards */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-[#A78BFA] tracking-wider block">
                  Select Autonomous Directive
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {PROTOCOLS.map((p) => {
                    const isSelected = selectedProtocol === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProtocol(p.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                          isSelected
                            ? "bg-[rgba(139,92,246,0.12)] border-[#A78BFA] shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                            : "bg-[#181c1f]/60 border-[rgba(139,92,246,0.2)] hover:border-[rgba(139,92,246,0.4)] hover:bg-[#181c1f]"
                        }`}
                      >
                        <div
                          className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#A78BFA] text-black font-bold"
                              : "bg-[#262a2e] text-[#cbc3d7]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {p.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-bold ${
                                isSelected ? "text-white" : "text-[#e0e3e7]"
                              }`}
                            >
                              {p.title}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2023] text-[#958ea0] border border-[#313538]">
                              {p.code}
                            </span>
                          </div>
                          <p className="text-xs text-[#cbc3d7] mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Details Summary */}
              <div className="p-4 rounded-xl border border-[rgba(139,92,246,0.25)] bg-[#101417] space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-[#958ea0]">
                  <span>ESTIMATED EXECUTION TIME</span>
                  <span className="text-[#A78BFA] font-bold">~{currentProtocol.duration}s</span>
                </div>
                <div className="flex justify-between items-center text-[#958ea0]">
                  <span>NEURAL COMPUTE CORES</span>
                  <span className="text-[#A78BFA] font-bold">12 DISTRIBUTED NODES</span>
                </div>
                <div className="flex justify-between items-center text-[#958ea0]">
                  <span>TELEMETRY OVERRIDE</span>
                  <span className="text-white font-bold">AUTHORIZED</span>
                </div>
              </div>
            </>
          ) : (
            /* Active / Completed Execution View */
            <div className="space-y-5">
              {/* Progress & Status */}
              <div className="p-4 rounded-xl bg-[#101417] border border-[rgba(139,92,246,0.3)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isRunning ? (
                      <Loader2 className="size-4 animate-spin text-[#A78BFA]" />
                    ) : (
                      <CheckCircle2 className="size-4 text-[#A78BFA]" />
                    )}
                    <span className="text-xs font-mono font-bold text-white">
                      {isRunning ? `EXECUTING ${currentProtocol.code}...` : "PROTOCOL COMPLETED"}
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

                <div className="text-[11px] font-mono text-[#cbc3d7] truncate">
                  {isRunning
                    ? currentProtocol.steps[currentStepIndex] || "Processing telemetry stream..."
                    : "All mission objectives achieved."}
                </div>
              </div>

              {/* Terminal Log Console */}
              <div className="rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#020408] p-4 font-mono text-xs text-[#cbc3d7] space-y-1.5 h-48 overflow-y-auto shadow-inner">
                <div className="text-[#A78BFA] font-bold mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                  <Terminal className="size-3.5" />
                  <span>FOUNDER_OS // TELEMETRY_STREAM</span>
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
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[rgba(139,92,246,0.25)] bg-[#101417] flex justify-between items-center">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg border border-[rgba(139,92,246,0.3)] bg-transparent text-[#cbc3d7] hover:bg-white/5 transition text-xs font-mono disabled:opacity-30 cursor-pointer"
          >
            {isCompleted ? "Dismiss" : "Cancel"}
          </button>

          {!isCompleted ? (
            <button
              onClick={handleStartProtocol}
              disabled={isRunning}
              className="bg-[#A78BFA] text-black hover:bg-[#bfa8ff] font-bold text-xs font-mono py-2.5 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_28px_rgba(139,92,246,0.7)] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>SYNCHRONIZING...</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current" />
                  <span>ENGAGE DIRECTIVE</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-bold text-xs font-mono py-2.5 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_28px_rgba(139,92,246,0.7)] flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="size-3.5" />
              <span>RETURN TO TELEMETRY</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
