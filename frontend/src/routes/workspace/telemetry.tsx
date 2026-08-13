import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useActiveVenture } from "@/lib/founderos/store";
import { ProtocolExecutionModal } from "@/components/founderos/telemetry/ProtocolExecutionModal";
import { DeployModuleModal, TelemetryModuleDef } from "@/components/founderos/telemetry/DeployModuleModal";
import { SignalRadarDrawer } from "@/components/founderos/telemetry/SignalRadarDrawer";
import { Sparkles, Terminal, Activity, Zap, CheckCircle2, RefreshCw, Cpu, Layers, ArrowUpRight, Plus, Radio, Lightbulb, Play } from "lucide-react";
import { toast } from "sonner";

const TITLE = "Mission Telemetry Terminal — FounderOS";
const DESCRIPTION = "Mission Telemetry Terminal provides real-time neural engine telemetry, market readiness radar, and autonomous module orchestration.";

export const Route = createFileRoute("/workspace/telemetry")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TelemetryTerminalPage,
});

function TelemetryTerminalPage() {
  const { venture, update } = useActiveVenture();
  const navigate = useNavigate();

  // Dialog & Drawer States
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [radarDrawerOpen, setRadarDrawerOpen] = useState(false);

  // Dynamic Telemetry State
  const [marketScore, setMarketScore] = useState(94);
  const [latencyMs, setLatencyMs] = useState(24);
  const [computeLoad, setComputeLoad] = useState(68);
  const [engineState, setEngineState] = useState<"Online" | "Hyper-Drive" | "Calibrating">("Online");

  // Dynamic Active Modules State
  const [isSynthActive, setIsSynthActive] = useState(false);
  const [synthLoading, setSynthLoading] = useState(false);
  const [lockedVectors, setLockedVectors] = useState<string[]>(["VECTOR_ANALYSIS", "NLP_MODEL_v2"]);
  const [customModules, setCustomModules] = useState<TelemetryModuleDef[]>([]);

  // Telemetry Log Stream
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "Neural Engine Core initialized. 12 distributed inference workers synchronized.",
    "Problem vector radar lock confirmed across 45+ developer feeds.",
    "Autonomous validation loop active with 94.2% confidence interval.",
  ]);

  // Jitter simulation for latency and compute load
  useEffect(() => {
    const timer = setInterval(() => {
      setLatencyMs((prev) => {
        const jitter = Math.floor(Math.random() * 5) - 2;
        return Math.max(18, Math.min(32, prev + jitter));
      });
      setComputeLoad((prev) => {
        const jitter = Math.floor(Math.random() * 5) - 2;
        return Math.max(62, Math.min(78, prev + jitter));
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const handleForceInitSynth = () => {
    setSynthLoading(true);
    setTelemetryLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Initiating Prototype Synth force override for "${venture?.name || "Active Venture"}"...`,
      ...prev,
    ]);

    setTimeout(() => {
      setSynthLoading(false);
      setIsSynthActive(true);
      setMarketScore(97);
      toast.success("Prototype Synthesizer locked! MVP architecture generated.");
      setTelemetryLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ✔ Prototype Synth complete: 3 MVP micro-features locked for 7-day deployment sprint.`,
        ...prev,
      ]);
    }, 2000);
  };

  const handleDeployModule = (mod: TelemetryModuleDef) => {
    if (customModules.some((m) => m.id === mod.id)) return;
    setCustomModules((prev) => [...prev, { ...mod, status: "Active" }]);
    toast.success(`Node "${mod.name}" successfully deployed to telemetry grid.`);
    setTelemetryLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Deployed new telemetry node: [${mod.name.toUpperCase()}]`,
      ...prev,
    ]);
    setDeployModalOpen(false);
  };

  const handleProtocolComplete = (res: any) => {
    setMarketScore((prev) => Math.min(99, prev + 2));
    toast.success("Mission Protocol execution synchronized with workspace.");
    setTelemetryLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Autonomous Directive executed with 0 anomalies. Telemetry readiness elevated.`,
      ...prev,
    ]);
  };

  const handleLockVector = (vector: string) => {
    if (!lockedVectors.includes(vector)) {
      setLockedVectors((prev) => [...prev, vector]);
      toast.success(`Vector "+${vector}" locked into active validation matrix.`);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[rgba(139,92,246,0.3)] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="font-mono text-xs text-[#A78BFA] uppercase flex items-center gap-2 tracking-wider font-semibold">
              <span className="size-2.5 rounded-full bg-[#A78BFA] animate-pulse shadow-[0_0_10px_#A78BFA]" />
              Neural Engine {engineState}
            </p>
            <span className="text-xs text-[#958ea0] font-mono">• Node: {venture?.name || "Untitled Venture"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white flex items-center gap-3">
            Mission Telemetry Terminal
          </h1>
          <p className="text-sm text-[#cbc3d7] mt-1 max-w-xl">
            Live neural analytics, real-time problem radar surveillance, and automated protocol synthesizer for high-velocity venture execution.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Quick Engine Mode Switcher */}
          <button
            onClick={() => {
              const next = engineState === "Online" ? "Hyper-Drive" : engineState === "Hyper-Drive" ? "Calibrating" : "Online";
              setEngineState(next);
              toast.info(`Neural Engine switched to ${next} mode`);
            }}
            className="px-3.5 py-2.5 rounded-lg border border-[rgba(139,92,246,0.3)] bg-[#181c1f] text-xs font-mono text-[#cbc3d7] hover:border-[#A78BFA] hover:text-white transition flex items-center gap-2 cursor-pointer"
            title="Toggle Engine Mode"
          >
            <Cpu className="size-3.5 text-[#A78BFA]" />
            <span>Mode: <strong className="text-white">{engineState}</strong></span>
          </button>

          {/* Primary Action: Execute Protocol */}
          <button
            onClick={() => setProtocolModalOpen(true)}
            className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-bold text-sm py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] cursor-pointer flex-1 md:flex-initial"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span>Execute Protocol</span>
          </button>
        </div>
      </div>

      {/* Telemetry Overview (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Readiness Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(65,223,160,0.06)] rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-sm font-medium text-[#cbc3d7]">Market Readiness</h3>
              <p className="text-[11px] font-mono text-[#958ea0] mt-0.5">Composite Vector Score</p>
            </div>
            <div className="size-8 rounded-lg bg-[#1c2023] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-lg">radar</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-display text-white tracking-tight">
                {marketScore}
              </span>
              <span className="text-base font-semibold text-[#A78BFA] mb-1">/ 100</span>
            </div>
            <div className="w-full bg-[#1c2023] h-2 mt-3 rounded-full overflow-hidden border border-[rgba(139,92,246,0.2)]">
              <div
                className="bg-[#A78BFA] h-full shadow-[0_0_12px_#A78BFA] transition-all duration-700 ease-out"
                style={{ width: `${marketScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Model Latency Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-[#cbc3d7]">Model Latency</h3>
              <p className="text-[11px] font-mono text-[#958ea0] mt-0.5">P99 Inference Cycle</p>
            </div>
            <div className="size-8 rounded-lg bg-[#1c2023] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#958ea0] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-lg">speed</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-display text-white">
                {latencyMs}
              </span>
              <span className="font-mono text-sm text-[#958ea0]">ms</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-[#cbc3d7]">
              <span className="size-2 rounded-full bg-[#A78BFA] animate-ping" />
              <span className="font-mono text-[11px]">Optimal Performance (Gemini 2.5)</span>
            </div>
          </div>
        </div>

        {/* Compute Load Card with Abstract Digital Visualization */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-sm font-medium text-[#cbc3d7]">Compute Load</h3>
              <p className="text-[11px] font-mono text-[#958ea0] mt-0.5">Active Vector Shards</p>
            </div>
            <div className="size-8 rounded-lg bg-[#1c2023] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#958ea0] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-lg">memory</span>
            </div>
          </div>

          <div className="mt-4 relative h-16 w-full overflow-hidden rounded-lg bg-[#0b0f12] border border-[rgba(139,92,246,0.2)] flex items-end justify-between px-3 pb-2">
            {/* SVG Animated Wave Visualizer */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg viewBox="0 0 200 40" className="w-full h-full text-[#A78BFA]">
                <path
                  d="M0,20 Q25,5 50,20 T100,20 T150,20 T200,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                <path
                  d="M0,20 Q25,35 50,20 T100,20 T150,20 T200,20"
                  fill="none"
                  stroke="#d0bcff"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </svg>
            </div>

            <div className="relative z-10 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-white">{computeLoad}%</span>
              <span className="text-[10px] font-mono text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-1.5 py-0.5 rounded border border-[rgba(139,92,246,0.3)]">
                HEALTHY
              </span>
            </div>
            <span className="relative z-10 text-[10px] font-mono text-[#958ea0]">12 Cores Active</span>
          </div>
        </div>
      </div>

      {/* Modules Section Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Autonomous Venture Modules
          </h2>
          <p className="text-xs text-[#cbc3d7] font-mono mt-0.5">
            Active neural processes executing continuous background market discovery
          </p>
        </div>
        <button
          onClick={() => setDeployModalOpen(true)}
          className="text-xs font-mono text-[#A78BFA] hover:text-white transition flex items-center gap-1 cursor-pointer"
        >
          <span>Explore All Modules</span>
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Idea Validation */}
        <div
          onClick={() => navigate({ to: "/workspace/idea-validation" as any })}
          className="glass-card rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden border border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.6)]"
        >
          <div className="absolute inset-0 bg-[rgba(139,92,246,0.04)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-[#262a2e] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                    Idea Validation
                    <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#A78BFA]" />
                  </h3>
                  <span className="text-[10px] font-mono text-[#958ea0]">VECTOR ENGINE v2.4</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[rgba(139,92,246,0.15)] text-[#A78BFA] font-mono text-xs border border-[rgba(139,92,246,0.3)] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#A78BFA] animate-pulse" /> Active
              </span>
            </div>

            <p className="text-sm text-[#cbc3d7] mb-6 leading-relaxed">
              Cross-referencing market pain points with current solution matrix. {lockedVectors.length * 6} distinct customer vectors identified.
            </p>

            <div className="flex flex-wrap gap-2">
              {lockedVectors.map((v) => (
                <span key={v} className="px-2.5 py-1 rounded bg-[#1c2023] text-[#958ea0] font-mono text-[10px] border border-white/5">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Module 2: Problem Radar */}
        <div
          onClick={() => setRadarDrawerOpen(true)}
          className="glass-card rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden border border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.6)]"
        >
          <div className="absolute inset-0 bg-[rgba(139,92,246,0.04)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-[#262a2e] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-xl">my_location</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                    Problem Radar
                    <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#A78BFA]" />
                  </h3>
                  <span className="text-[10px] font-mono text-[#958ea0]">SIGNAL INGESTION NODE</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[rgba(139,92,246,0.15)] text-[#A78BFA] font-mono text-xs border border-[rgba(139,92,246,0.3)] flex items-center gap-1">
                <Radio className="size-3 animate-pulse" /> Scanning
              </span>
            </div>

            <p className="text-sm text-[#cbc3d7] mb-6 leading-relaxed">
              Monitoring social signals, AskHN, Reddit & developer forums for emerging workflow friction points. Click to inspect live feed.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded bg-[#1c2023] text-[#958ea0] font-mono text-[10px] border border-white/5">
                SOCIAL_GRAPH
              </span>
              <span className="px-2.5 py-1 rounded bg-[#1c2023] text-[#958ea0] font-mono text-[10px] border border-white/5">
                REALTIME_INGEST
              </span>
            </div>
          </div>
        </div>

        {/* Module 3: Prototype Synth */}
        <div className="glass-card rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.6)] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-[#262a2e] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#958ea0]">
                  <span className="material-symbols-outlined text-xl">architecture</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                    Prototype Synth
                  </h3>
                  <span className="text-[10px] font-mono text-[#958ea0]">MVP BLUEPRINT BUILDER</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-mono text-xs border ${
                  isSynthActive
                    ? "bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border-[rgba(139,92,246,0.3)]"
                    : "bg-[#1c2023] text-[#958ea0] border-[#313538]"
                }`}
              >
                {isSynthActive ? "Active / Locked" : "Standby"}
              </span>
            </div>

            <p className="text-sm text-[#cbc3d7] mb-6 leading-relaxed">
              {isSynthActive
                ? "Synthesized 3 core MVP specs with locked 7-day launch roadmap. Ready for sprint execution."
                : "Awaiting definitive problem vector lock before generating initial UI/UX structures."}
            </p>
          </div>

          <div className="relative z-10">
            {isSynthActive ? (
              <button
                onClick={() => navigate({ to: "/workspace/mvp-scope" as any })}
                className="w-full py-2.5 bg-[#181c1f] hover:bg-[#262a2e] border border-[rgba(139,92,246,0.4)] rounded-lg text-[#A78BFA] font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Open Scoped MVP Spec</span>
              </button>
            ) : (
              <button
                onClick={handleForceInitSynth}
                disabled={synthLoading}
                className="w-full py-2.5 bg-transparent border border-[rgba(139,92,246,0.4)] rounded-lg text-[#A78BFA] hover:bg-[rgba(139,92,246,0.1)] hover:border-[#A78BFA] font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {synthLoading ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Synthesizing Architecture...</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current" />
                    <span>Force Init</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Deployed Modules (if any) */}
        {customModules.map((mod) => (
          <div
            key={mod.id}
            className="glass-card rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.6)] flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-[#262a2e] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA]">
                    <span className="material-symbols-outlined text-xl">{mod.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{mod.name}</h3>
                    <span className="text-[10px] font-mono text-[#958ea0]">{mod.category.toUpperCase()} NODE</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[rgba(139,92,246,0.15)] text-[#A78BFA] font-mono text-xs border border-[rgba(139,92,246,0.3)] flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#A78BFA]" /> Deployed
                </span>
              </div>
              <p className="text-sm text-[#cbc3d7] mb-6 leading-relaxed">{mod.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {mod.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded bg-[#1c2023] text-[#A78BFA] font-mono text-[10px] border border-white/5">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Deploy New Module Placeholder Card */}
        <div
          onClick={() => setDeployModalOpen(true)}
          className="glass-card rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-center items-center text-center border-dashed border-2 border-[rgba(139,92,246,0.35)] hover:border-[#A78BFA] bg-transparent min-h-[200px]"
        >
          <span className="material-symbols-outlined text-[#958ea0] text-4xl mb-3 group-hover:text-[#A78BFA] group-hover:scale-110 transition-all">
            add_box
          </span>
          <h3 className="text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors">
            Deploy New Module
          </h3>
          <p className="text-xs text-[#cbc3d7] mt-2 max-w-[220px] leading-relaxed">
            Install additional telemetry nodes from the enterprise marketplace.
          </p>
        </div>
      </div>

      {/* Real-time Telemetry Activity Stream Console */}
      <div className="rounded-xl border border-[rgba(139,92,246,0.25)] bg-[#070b0e] p-5 space-y-3 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2 text-[#A78BFA] font-bold">
            <Terminal className="size-4" />
            <span>NEURAL_EVENT_LOG // MISSION_TELEMETRY</span>
          </div>
          <span className="text-[10px] text-[#958ea0] flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#A78BFA] animate-pulse" /> LIVE STREAM
          </span>
        </div>

        <div className="space-y-1.5 text-[#cbc3d7] max-h-32 overflow-y-auto">
          {telemetryLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[#958ea0] select-none">&gt;</span>
              <span className={i === 0 ? "text-white font-medium" : ""}>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals and Drawers */}
      <ProtocolExecutionModal
        isOpen={protocolModalOpen}
        onClose={() => setProtocolModalOpen(false)}
        ventureName={venture?.name || "Active Venture"}
        onProtocolComplete={handleProtocolComplete}
      />

      <DeployModuleModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        installedModuleIds={["idea-validation", "problem-radar", "prototype-synth", ...customModules.map((m) => m.id)]}
        onDeployModule={handleDeployModule}
      />

      <SignalRadarDrawer
        isOpen={radarDrawerOpen}
        onClose={() => setRadarDrawerOpen(false)}
        onSelectSignalVector={handleLockVector}
      />
    </div>
  );
}
