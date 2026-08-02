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
    <section id="simulator" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Cyan Neon Laser Grid & Radar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] bg-gradient-to-r from-[#00F0FF]/20 via-[#4F8CFF]/25 to-[#00F0FF]/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#64D8FF]/40 bg-[#64D8FF]/10 text-xs font-mono text-[#64D8FF]">
          <Terminal className="size-3.5 text-[#64D8FF]" />
          <span>INTERACTIVE AI SIMULATOR</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-display text-[#F5F8FC] tracking-tight">
          Test Your Venture Idea in <br />
          <span className="text-gradient-neural">FounderOS Real-Time AI</span>
        </h2>
        <p className="text-base text-[#A8B3C7]">
          Enter your startup idea below to experience how FounderOS generates instant TAM analysis, validation scores, and 7-day launch blueprints.
        </p>
      </div>

      {/* Playground Console Container */}
      <div className="glass-card p-6 sm:p-10 border border-[#00F0FF]/30 bg-[#07111F]/95 backdrop-blur-2xl relative z-10 space-y-8 shadow-[0_0_60px_rgba(0,240,255,0.2)]">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#AAB7CC] mr-2">Try sample ideas:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setIdeaText(preset.prompt);
                handleSimulate(preset.prompt);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#00F0FF]/30 bg-[#0B1628] text-[#00F0FF] hover:border-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all font-semibold shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Console Input Bar */}
        <div className="relative">
          <textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            rows={3}
            placeholder="Describe your venture idea (e.g., 'An AI agent platform that automates customer support for Shopify stores')..."
            className="w-full p-4 rounded-2xl border border-[#00F0FF]/40 bg-[#02040A] text-white placeholder-[#74839A]/60 focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/50 font-mono text-sm resize-none shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => handleSimulate()}
              disabled={isGenerating || !ideaText.trim()}
              className="btn-primary-blue px-6 py-3.5 rounded-xl text-sm font-extrabold disabled:opacity-50 flex items-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.5)]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="size-4 animate-spin text-[#00F0FF]" />
                  <span>Computing Telemetry...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current text-[#02040A]" />
                  <span>Run Mission Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Output Simulation Window */}
        {result && (
          <div className="p-6 rounded-2xl border border-[#00F0FF]/50 bg-[#02040A]/95 space-y-6 animate-fade-in font-mono shadow-[0_0_40px_rgba(0,240,255,0.25)]">
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-[#00F0FF] animate-ping shadow-[0_0_10px_#00F0FF]" />
                <span className="text-white font-bold text-lg">{result.ventureName}</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-bold">
                  {result.category}
                </span>
              </div>
              <div className="text-xs text-[#00F0FF] font-bold">
                VALIDATION CONFIDENCE: <strong className="neon-text-cyan text-sm">{result.validationScore} / 100</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Box 1 */}
              <div className="p-4 rounded-xl border border-[#00F0FF]/30 bg-[#0B1628] space-y-2">
                <p className="text-[#74839A] uppercase tracking-wider text-[10px]">Market Velocity & TAM</p>
                <p className="text-xl font-bold text-white neon-text-cyan">{result.tam}</p>
                <p className="text-[11px] text-[#5AF2A2]">High buyer willingness-to-pay index</p>
              </div>

              {/* Box 2 */}
              <div className="p-4 rounded-xl border border-[#00F0FF]/30 bg-[#0B1628] space-y-2">
                <p className="text-[#74839A] uppercase tracking-wider text-[10px]">Competitor Whitespace</p>
                <div className="flex flex-wrap gap-1">
                  {result.targetCompetitors.map((comp) => (
                    <span key={comp} className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px]">
                      {comp}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#00F0FF]">Key Unfair Advantage: 4.8x faster</p>
              </div>

              {/* Box 3 */}
              <div className="p-4 rounded-xl border border-[#00F0FF]/30 bg-[#0B1628] space-y-2">
                <p className="text-[#74839A] uppercase tracking-wider text-[10px]">Recommended Sprint</p>
                <p className="text-base font-bold text-[#00F0FF]">{result.launchTimeline}</p>
                <p className="text-[11px] text-[#AAB7CC]">3 Core Features max to ship</p>
              </div>
            </div>

            {/* Scope Features Checklist */}
            <div className="space-y-2 pt-2">
              <p className="text-xs text-[#74839A] uppercase tracking-widest">Scoped MVP Build Roadmap:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {result.mvpScope.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-white/[0.08] bg-[#07111F] flex items-center gap-2 text-xs text-white">
                    <CheckCircle2 className="size-4 text-[#5AF2A2] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <a
                href="/signin"
                className="btn-primary-blue inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold"
              >
                <span>Launch This Venture in FounderOS</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
