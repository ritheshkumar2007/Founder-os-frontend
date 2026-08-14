import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Cpu,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  Search,
  Rocket,
  Shield,
  Layers,
  BarChart3,
  Users,
  MessageSquare,
  Compass,
  Lock,
  RefreshCw,
  Bell,
} from "lucide-react";

export const InteractiveHeroDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ai" | "validation" | "sprint" | "investor">("ai");
  const [typedOutput, setTypedOutput] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic 3D perspective tilt tracking
  const [tilt, setTilt] = useState({ rotateX: 6, rotateY: -2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || typeof window === "undefined" || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = - (y / rect.height) * 14;
    const rotateY = (x / rect.width) * 14;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 6, rotateY: -2 });
  };

  const initialLogs = [
    "> FOUNDEROS NEURAL CORE v3.8 INITIALIZED...",
    "> TELEMETRY LINK: STABLE [LATENCY 12ms]",
    "> VENTURE: NEURALFLOW AI (B2A DEV PLATFORM)",
    "> COMPETITIVE WHITESPACE DETECTED: 94.2% SCORE",
    "> MVP SCOPE: 3 CORE MODULES IDENTIFIED (ESTIMATED SPRINT: 7 DAYS)",
    "> READY FOR COMMAND INPUT..."
  ];

  useEffect(() => {
    setMounted(true);
    setTypedOutput(initialLogs);
  }, []);

  const runSimulationPrompt = (promptText: string) => {
    setIsSimulating(true);
    setTypedOutput((prev) => [...prev, `\n> EXECUTING COMMAND: "${promptText}"`]);

    setTimeout(() => {
      setTypedOutput((prev) => [
        ...prev,
        "> ANALYZING TARGET VECTOR...",
        "> SCRAPING 42 COMPETITOR DATA POINTS...",
        "> TAM ESTIMATION: $3.8B GLOBAL ANNUAL MARKET."
      ]);
    }, 600);

    setTimeout(() => {
      setTypedOutput((prev) => [
        ...prev,
        "> VALIDATION ENGINE: 92% CONFIDENCE SCORE.",
        "> GENERATING 7-DAY SPRINT ROADMAP...",
        "✔ SPRINT ROADMAP CREATED SUCCESSFULLY. READY TO SHIP."
      ]);
      setIsSimulating(false);
      setCustomPrompt("");
    }, 1400);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-6xl mx-auto transition-transform duration-300 ease-out font-sans overflow-hidden lg:overflow-visible"
      style={{
        perspective: "1200px",
      }}
    >
      {/* Soft Ambient Energy Glow behind dashboard */}
      <div className="absolute -inset-6 bg-[rgba(139,92,246,0.15)] rounded-[36px] blur-3xl opacity-75 pointer-events-none animate-pulse-glow" />

      {/* Floating Anti-Gravity Badge 1 */}
      <div 
        className="hidden lg:flex absolute -top-6 -left-6 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12]/95 backdrop-blur-xl text-xs font-sans text-[#A78BFA] shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
        style={{ transform: "translateZ(65px)" }}
      >
        <Sparkles className="size-4 text-[#A78BFA]" />
        <span className="font-semibold">AI VIABILITY SCORE: <span className="font-mono font-bold text-white">94/100</span></span>
      </div>

      {/* Floating Anti-Gravity Badge 2 */}
      <div 
        className="hidden lg:flex absolute -bottom-6 -right-6 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12]/95 backdrop-blur-xl text-xs font-sans text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
        style={{ transform: "translateZ(75px)" }}
      >
        <CheckCircle2 className="size-4 text-[#A78BFA]" />
        <span className="font-semibold text-white">7-DAY SPRINT: ON TRACK</span>
      </div>

      {/* Main OS Window Floating Dashboard Chassis */}
      <div
        className="relative rounded-[20px] sm:rounded-[24px] border border-[rgba(139,92,246,0.3)] bg-[#0b0f12]/95 backdrop-blur-2xl shadow-[0_35px_90px_rgba(0,0,0,0.85)] overflow-hidden"
        style={{
          transform: mounted && typeof window !== "undefined" && window.innerWidth >= 1024 ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)` : "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top Desktop OS Window Titlebar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[rgba(139,92,246,0.25)] bg-[#101417]">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="size-2.5 sm:size-3 rounded-full bg-[#313538]" />
              <div className="size-2.5 sm:size-3 rounded-full bg-[#262a2e]" />
              <div className="size-2.5 sm:size-3 rounded-full bg-[#A78BFA]" />
            </div>
            <div className="h-4 w-px bg-white/10 shrink-0" />
            <div className="flex items-center gap-2 text-xs font-sans text-white truncate">
              <Rocket className="size-3.5 text-[#A78BFA] shrink-0" />
              <span className="font-semibold tracking-wide truncate">FOUNDEROS</span>
              <span className="text-white/30 hidden sm:inline">/</span>
              <span className="text-[#A78BFA] font-medium hidden sm:inline">Workspace Preview</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-sans">
            <div className="px-2.5 py-1 rounded-md bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#A78BFA] font-medium text-[11px] flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
              <span>COPILOT ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          {/* Left Sidebar Panel: Venture Navigator */}
          <div className="lg:col-span-3 border-r border-white/[0.08] bg-[#020408]/50 p-5 space-y-5" style={{ transform: "translateZ(30px)" }}>
            <div>
              <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#958ea0]">
                Active Venture
              </p>
              <h3 className="font-display text-base font-bold text-white mt-1 flex items-center gap-2">
                <span>NeuralFlow AI</span>
                <span className="size-2 rounded-full bg-[#A78BFA]" />
              </h3>
              <p className="text-xs font-sans text-[#cbc3d7] mt-0.5">B2B Developer Infrastructure</p>
            </div>

            {/* Validation Meter Gauge */}
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#101417] space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[#cbc3d7] font-medium">Viability Score</span>
                <span className="text-[#A78BFA] font-mono font-bold">94 / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full bg-[#A78BFA] w-[94%]" />
              </div>
              <p className="text-[11px] font-sans text-[#958ea0]">High market willingness-to-pay</p>
            </div>

            {/* Flight Path Navigation Steps without 01-05 repetition */}
            <div className="space-y-1">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#958ea0] px-2 mb-2">
                System Workflow
              </p>
              {[
                { name: "Validation Brief", status: "complete" },
                { name: "Problem Radar", status: "complete" },
                { name: "Precision MVP Scope", status: "complete" },
                { name: "7-Day Build Sprint", status: "current" },
                { name: "Investor Data Room", status: "upcoming" },
              ].map((step) => (
                <div
                  key={step.name}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-colors ${
                    step.status === "current"
                      ? "bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#A78BFA] font-semibold"
                      : step.status === "complete"
                      ? "text-white/80 hover:bg-white/[0.04]"
                      : "text-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{step.name}</span>
                  </div>
                  {step.status === "complete" ? (
                    <CheckCircle2 className="size-3.5 text-[#A78BFA]" />
                  ) : step.status === "current" ? (
                    <span className="size-2 rounded-full bg-[#A78BFA] animate-ping" />
                  ) : (
                    <Lock className="size-3 text-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Workspace Terminal Area */}
          <div className="lg:col-span-9 flex flex-col justify-between p-4 sm:p-6 bg-[#0b0f12]">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 sm:pb-4 gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: "ai", label: "AI Copilot", fullLabel: "AI Copilot Terminal", icon: Terminal },
                  { id: "validation", label: "Problem Radar", fullLabel: "Problem Radar", icon: Activity },
                  { id: "sprint", label: "7-Day Sprint", fullLabel: "7-Day Sprint Deck", icon: Zap },
                  { id: "investor", label: "Traction", fullLabel: "Traction Telemetry", icon: BarChart3 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-sans font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#A78BFA] text-black font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                          : "bg-[#101417] border border-white/[0.08] text-[#cbc3d7] hover:text-white hover:border-white/20"
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="sm:hidden">{tab.label}</span>
                      <span className="hidden sm:inline">{tab.fullLabel}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs font-sans font-semibold text-[#A78BFA] shrink-0">
                <Sparkles className="size-3.5 text-[#A78BFA]" />
                <span>NEURAL ENGINE</span>
              </div>
            </div>

            {/* Tab 1: AI Copilot Console */}
            {activeTab === "ai" && (
              <div className="my-4 sm:my-5 flex-1 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#020408] p-3.5 sm:p-5">
                <div className="space-y-2 font-mono text-xs text-[#A78BFA] overflow-y-auto max-h-[200px] sm:max-h-[220px] scrollbar-thin">
                  {typedOutput.map((line, idx) => (
                    <p
                      key={idx}
                      className={
                        line.startsWith("> EXECUTING")
                          ? "text-[#A78BFA] font-bold"
                          : line.startsWith("✔")
                          ? "text-white font-bold"
                          : "text-white/90"
                      }
                    >
                      {line}
                    </p>
                  ))}
                  {isSimulating && (
                    <p className="text-[#A78BFA] animate-pulse">
                      Processing neural telemetry vectors...
                    </p>
                  )}
                </div>

                {/* Prompt Quick Actions */}
                <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 font-sans">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
                    <span className="text-[#958ea0] py-1 font-medium hidden sm:inline">Preset Commands:</span>
                    {[
                      "Analyze TAM & Whitespace",
                      "Scope 7-Day MVP",
                      "Generate Investor Pitch",
                    ].map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => runSimulationPrompt(cmd)}
                        className="px-2 sm:px-2.5 py-1 rounded-lg border border-white/10 bg-[#101417] text-[#cbc3d7] hover:text-white hover:border-[rgba(139,92,246,0.5)] hover:bg-[rgba(139,92,246,0.15)] transition-colors font-medium cursor-pointer"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customPrompt.trim()) runSimulationPrompt(customPrompt);
                    }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                  >
                    <div className="relative flex-1">
                      <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#A78BFA]" />
                      <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Type a command (e.g. 'Scope 7-Day MVP')..."
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-white placeholder-[#958ea0] focus:outline-none focus:border-[#A78BFA] font-sans text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSimulating}
                      className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] text-black text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Run</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab 2: Validation Radar */}
            {activeTab === "validation" && (
              <div className="my-4 sm:my-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#020408] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <Activity className="size-4 text-[#A78BFA]" /> Problem Intensity Signal
                    </span>
                    <span className="text-[#A78BFA] font-mono font-bold">9.2 / 10</span>
                  </div>
                  <p className="text-xs text-[#cbc3d7]">
                    Synthesized from 28 customer validation calls. 82% reported severe pain with existing slow manual dev pipelines.
                  </p>
                  <div className="space-y-2 pt-2">
                    {[
                      { label: "Deployment Latency", pain: 92 },
                      { label: "Cost Overruns", pain: 78 },
                      { label: "Tooling Fragmentation", pain: 88 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px] text-[#cbc3d7]">
                          <span>{item.label}</span>
                          <span className="text-[#A78BFA] font-mono">{item.pain}% pain score</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#A78BFA]"
                            style={{ width: `${item.pain}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#020408] space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                      Target Audience Persona
                    </h4>
                    <p className="text-sm font-bold text-white mt-1">Lead AI Infrastructure Engineers</p>
                    <p className="text-xs text-[#cbc3d7] mt-2">
                      "We spend 40% of our week configuring agentic workflows manually. We need an automated control deck."
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-xs text-[#A78BFA] flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0" />
                    <span className="font-semibold text-white">Product-Market Fit Signal: STRONG PMF</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: 7-Day Sprint Flight Deck */}
            {activeTab === "sprint" && (
              <div className="my-4 sm:my-5 flex-1 space-y-4 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] text-xs text-white gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <Zap className="size-4 text-[#A78BFA] shrink-0" />
                    <span className="font-medium">SPRINT COUNTDOWN:</span>
                    <strong className="text-[#A78BFA] text-xs sm:text-sm font-mono tracking-wider sm:tracking-widest">
                      05D : 18H : 42M
                    </strong>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#A78BFA] text-black font-semibold text-[10px] sm:text-[11px] self-start sm:self-auto">
                    ON TRACK
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      day: "Day 01-02",
                      title: "Core API Architecture",
                      status: "Done",
                      badge: "bg-[rgba(139,92,246,0.2)] text-[#A78BFA]",
                    },
                    {
                      day: "Day 03-04",
                      title: "Landing Page & Waitlist",
                      status: "In Progress",
                      badge: "bg-[rgba(139,92,246,0.15)] text-white",
                    },
                    {
                      day: "Day 05-07",
                      title: "Launch Sprint & Demo",
                      status: "Queued",
                      badge: "bg-white/10 text-white/60",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="p-4 rounded-xl border border-white/[0.08] bg-[#020408] space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#cbc3d7] font-mono">{card.day}</span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${card.badge}`}>{card.status}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{card.title}</h5>
                      <p className="text-[11px] text-[#958ea0]">Zero scope-creep rules active.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Traction Telemetry */}
            {activeTab === "investor" && (
              <div className="my-4 sm:my-5 flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                {[
                  { label: "Target TAM", val: "$4.2B", change: "+14% YoY" },
                  { label: "Waitlist Traction", val: "1,840", change: "+320 this week" },
                  { label: "Est. Burn Rate", val: "$3.2k/mo", change: "Ultra efficient" },
                  { label: "Launch Velocity", val: "9.8x", change: "Top 1% cohort" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] bg-[#020408] space-y-1 min-w-0"
                  >
                    <p className="text-[10px] text-[#958ea0] uppercase font-semibold tracking-wider truncate">{stat.label}</p>
                    <p className="text-lg sm:text-xl font-bold font-mono text-white truncate">{stat.val}</p>
                    <p className="text-[10px] text-[#A78BFA] truncate">{stat.change}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Status Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-sans text-[#cbc3d7] gap-2">
              <div className="flex items-center gap-2 text-[#cbc3d7]">
                <CheckCircle2 className="size-3.5 text-[#A78BFA]" />
                <span>Live workspace synchronization ready</span>
              </div>
              <div className="text-[#A78BFA] font-semibold text-[10px] sm:text-[11px]">
                5-Stage System Connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
