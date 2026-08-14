import React, { useState } from "react";
import { Sparkles, Terminal, Play, CheckCircle2, ArrowRight, ShieldAlert, Cpu, BarChart2, Layers } from "lucide-react";

interface TelemetryResult {
  ventureName: string;
  category: string;
  tam: string;
  validationScore: number;
  pitchHeadline: string;
  mvpScope: string[];
  launchTimeline: string;
  targetCompetitors: string[];
}

const PRESETS = [
  {
    label: "AI Code Review Agent",
    prompt: "Autonomous AI agent that reviews pull requests, runs security audits, and writes unit tests for GitHub repos."
  },
  {
    label: "Robotic Farm Operating System",
    prompt: "Autonomous drone and robotics control system for high-precision indoor vertical farms."
  },
  {
    label: "B2B SaaS Price Optimizer",
    prompt: "Real-time dynamic pricing API for multi-tenant SaaS platforms based on usage metrics and competitor intelligence."
  }
];

export const TelemetryPlayground: React.FC = () => {
  const [ideaText, setIdeaText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TelemetryResult | null>(null);

  const handleSimulate = (promptToRun?: string) => {
    const text = promptToRun || ideaText;
    if (!text.trim()) return;

    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const isAI = text.toLowerCase().includes("ai") || text.toLowerCase().includes("agent");
      const isFarm = text.toLowerCase().includes("farm") || text.toLowerCase().includes("drone");

      setResult({
        ventureName: isAI ? "SyntaxPulse AI" : isFarm ? "AeroCrop OS" : "YieldFlow Engine",
        category: isAI ? "Developer Tooling & Security" : isFarm ? "AgriTech Robotics" : "FinTech SaaS",
        tam: isAI ? "$5.4B Global" : isFarm ? "$2.8B Target" : "$8.1B Market",
        validationScore: Math.floor(Math.random() * 12) + 87,
        pitchHeadline: `The Mission Control platform for ${text.slice(0, 45)}...`,
        mvpScope: [
          "Core Autonomous Engine API (v1.0)",
          "Real-time Telemetry Dashboard & Alert System",
          "One-Click Stripe Billing & User Auth Integration"
        ],
        launchTimeline: "7-Day Sprint Flight Ready",
        targetCompetitors: isAI ? ["SonarQube", "Snyk", "Dependabot"] : ["Legacy ERPs", "Manual Spreadsheets"]
      });
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <section id="simulator" className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Neon Laser Grid & Radar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[320px] sm:size-[650px] bg-[rgba(139,92,246,0.15)] rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.1)] text-xs font-mono text-[#A78BFA]">
          <Terminal className="size-3.5 text-[#A78BFA]" />
          <span>INTERACTIVE AI SIMULATOR</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
          Test Your Venture Idea in <br />
          <span className="text-gradient-neural">FounderOS Real-Time AI</span>
        </h2>
        <p className="text-sm sm:text-base text-[#cbc3d7] max-w-2xl mx-auto leading-relaxed">
          Enter your startup idea below to experience how FounderOS generates instant TAM analysis, validation scores, and 7-day launch blueprints.
        </p>
      </div>

      {/* Playground Console Container */}
      <div className="glass-card p-4 sm:p-8 lg:p-10 border border-[rgba(139,92,246,0.3)] bg-[#0b0f12]/95 backdrop-blur-2xl relative z-10 space-y-6 sm:space-y-8 shadow-[0_0_60px_rgba(139,92,246,0.15)] rounded-2xl sm:rounded-3xl">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#958ea0] mr-2 w-full sm:w-auto">Try sample ideas:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setIdeaText(preset.prompt);
                handleSimulate(preset.prompt);
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] text-[#A78BFA] hover:border-[#A78BFA] hover:bg-[rgba(139,92,246,0.15)] transition-all font-semibold shadow-[0_0_10px_rgba(139,92,246,0.15)] cursor-pointer text-xs"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Console Input Bar */}
        <div className="relative space-y-3">
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            rows={3}
            placeholder="Describe your venture idea (e.g., 'An AI agent platform that automates customer support for Shopify stores')..."
            className="w-full p-3.5 sm:p-4 rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#020408] text-white placeholder-[#958ea0] focus:outline-none focus:border-[#A78BFA] font-mono text-xs sm:text-sm resize-none shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSimulate()}
              disabled={isGenerating || !ideaText.trim()}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold disabled:opacity-50 flex items-center justify-center gap-2 bg-[#A78BFA] hover:bg-[#bfa8ff] text-black shadow-[0_0_30px_rgba(139,92,246,0.4)] transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="size-4 animate-spin text-black" />
                  <span>Computing Telemetry...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current text-black" />
                  <span>Run Mission Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Output Simulation Window */}
        {result && (
          <div className="p-4 sm:p-6 rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#020408]/95 space-y-5 sm:space-y-6 animate-fade-in font-mono shadow-[0_0_40px_rgba(139,92,246,0.2)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="size-2.5 sm:size-3 rounded-full bg-[#A78BFA] animate-ping shadow-[0_0_10px_#A78BFA]" />
                <span className="text-white font-bold text-base sm:text-lg">{result.ventureName}</span>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] font-bold">
                  {result.category}
                </span>
              </div>
              <div className="text-xs text-[#A78BFA] font-bold">
                CONFIDENCE: <strong className="text-white text-sm">{result.validationScore} / 100</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
              {/* Box 1 */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] space-y-1.5">
                <p className="text-[#958ea0] uppercase tracking-wider text-[10px]">Market Velocity & TAM</p>
                <p className="text-lg sm:text-xl font-bold text-white">{result.tam}</p>
                <p className="text-[10px] sm:text-[11px] text-[#A78BFA]">High buyer willingness-to-pay</p>
              </div>

              {/* Box 2 */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] space-y-1.5">
                <p className="text-[#958ea0] uppercase tracking-wider text-[10px]">Competitor Whitespace</p>
                <div className="flex flex-wrap gap-1">
                  {result.targetCompetitors.map((comp) => (
                    <span key={comp} className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px]">
                      {comp}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#cbc3d7]">Unfair Advantage: 4.8x faster</p>
              </div>

              {/* Box 3 */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] space-y-1.5 sm:col-span-2 md:col-span-1">
                <p className="text-[#958ea0] uppercase tracking-wider text-[10px]">Recommended Sprint</p>
                <p className="text-sm sm:text-base font-bold text-[#A78BFA]">{result.launchTimeline}</p>
                <p className="text-[10px] sm:text-[11px] text-[#cbc3d7]">3 Core Features max to ship</p>
              </div>
            </div>

            {/* Scope Features Checklist */}
            <div className="space-y-2 pt-2">
              <p className="text-xs text-[#958ea0] uppercase tracking-widest">Scoped MVP Build Roadmap:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {result.mvpScope.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-white/[0.08] bg-[#101417] flex items-center gap-2 text-xs text-white">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href="/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#A78BFA] hover:bg-[#bfa8ff] text-black transition cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                <span>Launch This Venture in FounderOS</span>
                <ArrowRight className="size-3.5 text-black" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
