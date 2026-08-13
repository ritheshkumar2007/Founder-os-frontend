import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button, CopyButton, Empty, Field, LinkButton, PageHeader, Panel, TextArea, TextInput } from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Printer, Copy, CheckCircle2, History, TrendingUp, Flag, ShieldAlert, DollarSign, FileText, AlertCircle, Download, FolderOpen, ArrowUpRight, ArrowRight, Lock, Eye, Table, Gavel, PieChart } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import { CapTableModal } from "@/components/founderos/investor/CapTableModal";
import { DataRoomModal } from "@/components/founderos/investor/DataRoomModal";
import api from "@/lib/api";
import { toast } from "sonner";

const TITLE = "Investor Telemetry & Data Room — FounderOS";
const DESCRIPTION = "Real-time financial performance and data room access for active venture partners.";

export const Route = createFileRoute("/workspace/investor-update")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestorTelemetryPage,
});

export interface InvestorUpdateData {
  companyOverview: string;
  period: { month: string; quarter: string };
  startupProgress: {
    milestones: string[];
    productUpdates: string[];
    tractionHighlights: string[];
    revenueUpdates: string[];
  };
  investorMessage: {
    summary: string;
    keyAchievements: string[];
    growthMetrics: string[];
    challenges: string[];
    solutions: string[];
    nextQuarterGoals: string[];
    fundingNeeds: string;
  };
  generatedUpdateText: string;
}

const ARR_TIMEFRAMES: Record<string, { value: string; yoy: string; points: string; area: string; lastPoint: { cx: number; cy: number } }> = {
  "1M": {
    value: "$1.08M MRR",
    yoy: "+18% MoM",
    points: "M0,150 L200,140 L400,120 L600,80 L800,50",
    area: "M0,150 L200,140 L400,120 L600,80 L800,50 L800,200 L0,200 Z",
    lastPoint: { cx: 800, cy: 50 },
  },
  "1Q": {
    value: "$3.1M Q-Run",
    yoy: "+42% QoQ",
    points: "M0,160 L150,140 L300,130 L450,90 L600,70 L750,40 L800,30",
    area: "M0,160 L150,140 L300,130 L450,90 L600,70 L750,40 L800,30 L800,200 L0,200 Z",
    lastPoint: { cx: 800, cy: 30 },
  },
  "1Y": {
    value: "$12.4M",
    yoy: "145% YoY",
    points: "M0,180 L100,160 L200,170 L300,120 L400,130 L500,80 L600,90 L700,40 L800,20",
    area: "M0,180 L100,160 L200,170 L300,120 L400,130 L500,80 L600,90 L700,40 L800,20 L800,200 L0,200 Z",
    lastPoint: { cx: 800, cy: 20 },
  },
  "ALL": {
    value: "$18.6M Lifetime",
    yoy: "3.8x Cumulative",
    points: "M0,190 L120,180 L240,150 L360,110 L480,90 L600,60 L720,30 L800,15",
    area: "M0,190 L120,180 L240,150 L360,110 L480,90 L600,60 L720,30 L800,15 L800,200 L0,200 Z",
    lastPoint: { cx: 800, cy: 15 },
  },
};

function InvestorTelemetryPage() {
  const { venture, update } = useActiveVenture();

  // Dialog States
  const [capTableModalOpen, setCapTableModalOpen] = useState(false);
  const [dataRoomModalOpen, setDataRoomModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"telemetry" | "memo-generator">("telemetry");
  const [arrTimeframe, setArrTimeframe] = useState<string>("1Y");

  // AI Generator Data State
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updateDoc, setUpdateDoc] = useState<InvestorUpdateData | null>(null);
  const [editableLetter, setEditableLetter] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Inputs Form
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [overviewInput, setOverviewInput] = useState("");
  const [tractionInput, setTractionInput] = useState("");
  const [progressInput, setProgressInput] = useState("");
  const [challengesInput, setChallengesInput] = useState("");
  const [goalsInput, setGoalsInput] = useState("");
  const [fundingInput, setFundingInput] = useState("");

  const ventureId = venture?.id || (venture as any)?._id || "default-venture";

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setOverviewInput(venture.brief?.building || "");
      loadInvestorUpdateHistory();
    }
  }, [ventureId]);

  async function loadInvestorUpdateHistory() {
    try {
      const res = await api.getInvestorUpdateHistoryModule(ventureId);
      if (res.success && res.data?.investorUpdate) {
        setUpdateDoc(res.data.investorUpdate);
        setEditableLetter(res.data.investorUpdate.generatedUpdateText || "");
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load investor update history:", err);
    }
  }

  async function handleGenerateInvestorUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;
    setGenerating(true);
    try {
      const res = await api.generateInvestorUpdateModule({
        ventureId,
        ventureName: ventureNameInput || "Untitled Venture",
        overview: overviewInput || "Startup Concept",
        milestones: "MVP scope finalized & technical architecture built",
        traction: tractionInput || "$12.4M ARR with 145% YoY growth",
        progress: progressInput || "Core resolution engine implemented & tested",
        challenges: challengesInput || "Scaling engineering team and sales velocity",
        goals: goalsInput || "Expand enterprise tier and international GTM",
        funding: fundingInput || "Series B Growth Round",
      });

      if (res.success && res.data?.investorUpdate) {
        setUpdateDoc(res.data.investorUpdate);
        setEditableLetter(res.data.investorUpdate.generatedUpdateText || "");
        toast.success("Executive memorandum generated successfully.");
      }
    } catch (err) {
      console.warn("Failed to generate investor update:", err);
      toast.error("Failed to generate investor update.");
    } finally {
      setGenerating(false);
    }
  }

  const handleExportDeck = () => {
    toast.info("Generating formatted confidential investor deck...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const chartData = ARR_TIMEFRAMES[arrTimeframe] || ARR_TIMEFRAMES["1Y"];

  return (
    <div className="space-y-8 select-none">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 font-mono text-xs border border-white/10 font-semibold">
              CONFIDENTIAL
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#1c2023] text-[#cbc3d7] font-mono text-xs border border-white/5">
              Q4 2026 AUDIT
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
            Investor Telemetry
          </h1>
          <p className="text-base text-[#cbc3d7] mt-1 max-w-2xl leading-relaxed">
            Real-time financial performance, cap table allocation, and virtual data room access for active venture partners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#181c1f] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("telemetry")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                viewMode === "telemetry"
                  ? "bg-zinc-800 text-white border border-white/10 font-bold shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  : "text-[#cbc3d7] hover:text-white"
              }`}
            >
              Telemetry Dashboard
            </button>
            <button
              onClick={() => setViewMode("memo-generator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                viewMode === "memo-generator"
                  ? "bg-zinc-800 text-white border border-white/10 font-bold shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  : "text-[#cbc3d7] hover:text-white"
              }`}
            >
              Executive Memo
            </button>
          </div>

          <button
            onClick={handleExportDeck}
            className="px-5 py-2.5 rounded-lg border border-white/10 bg-[#181c1f] hover:bg-white/5 text-white font-mono text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="size-3.5 text-zinc-300" />
            <span>Export Deck</span>
          </button>

          <button
            onClick={() => setDataRoomModalOpen(true)}
            className="btn-system text-white font-mono font-bold text-xs px-5 py-2.5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition flex items-center gap-2 cursor-pointer"
          >
            <FolderOpen className="size-4" />
            <span>Open Data Room</span>
          </button>
        </div>
      </div>

      {viewMode === "telemetry" ? (
        /* Main Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Key Metric: Annual Recurring Revenue / MRR (Span 8) */}
          <div className="md:col-span-8 glass-card rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between border border-[#d4d4d8] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 z-10">
              <div>
                <h2 className="text-[#cbc3d7] font-mono text-xs uppercase tracking-wider mb-1.5">
                  Annual Recurring Revenue
                </h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight">
                    {chartData.value}
                  </span>
                  <span className="flex items-center text-zinc-300 font-mono text-xs bg-zinc-800/60 border border-white/10 px-2.5 py-1 rounded-full font-bold">
                    <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span>
                    {chartData.yoy}
                  </span>
                </div>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex gap-1 bg-[#0b0f12] rounded-lg p-1 border border-white/10">
                {["1M", "1Q", "1Y", "ALL"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setArrTimeframe(t)}
                    className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                      arrTimeframe === t
                        ? "bg-zinc-800/60 text-zinc-300 font-bold shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                        : "text-[#958ea0] hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing SVG Chart Area */}
            <div className="w-full h-56 md:h-64 mt-auto relative z-10">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="violet-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line stroke="#313538" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" opacity="0.5" />
                <line stroke="#313538" strokeDasharray="4" x1="0" x2="800" y1="100" y2="100" opacity="0.5" />
                <line stroke="#313538" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" opacity="0.5" />

                {/* Area Fill */}
                <path d={chartData.area} fill="url(#violet-gradient)" className="transition-all duration-700 ease-out" />

                {/* Glowing Stroke Line */}
                <path
                  d={chartData.points}
                  fill="none"
                  stroke="#d4d4d8"
                  strokeWidth="3"
                  className="transition-all duration-700 ease-out"
                  style={{ filter: "drop-shadow(0px 4px 8px rgba(167, 139, 250, 0.5))" }}
                />

                {/* Interactive Points */}
                <circle cx="700" cy="40" fill="#101417" r="4" stroke="#d4d4d8" strokeWidth="2" />
                <circle
                  cx={chartData.lastPoint.cx}
                  cy={chartData.lastPoint.cy}
                  fill="#d4d4d8"
                  r="6"
                  className="animate-pulse shadow-[0_0_12px_#d4d4d8]"
                />
              </svg>
            </div>
          </div>

          {/* Key Metric: Capital Raised & Runway (Span 4) */}
          <div className="md:col-span-4 glass-card rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden border border-white/10">
            <div className="z-10">
              <h2 className="text-[#cbc3d7] font-mono text-xs uppercase tracking-wider mb-1.5">
                Total Capital Raised
              </h2>
              <span className="text-3xl md:text-4xl font-bold font-display text-white block mb-6">
                $420M+
              </span>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[#cbc3d7]">Series C</span>
                  <span className="text-white font-bold">$250M</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[#cbc3d7]">Series B</span>
                  <span className="text-white font-bold">$120M</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[#cbc3d7]">Series A</span>
                  <span className="text-white font-bold">$45M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#cbc3d7]">Seed Round</span>
                  <span className="text-white font-bold">$5M</span>
                </div>
              </div>
            </div>

            <div className="mt-8 z-10">
              <div className="w-full h-2.5 bg-[#1c2023] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-[#d4d4d8] to-[#d4d4d8] rounded-full w-[85%] relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <div className="absolute right-0 top-0 h-full w-4 bg-white/50 blur-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2.5 font-mono text-xs">
                <span className="text-[#958ea0]">Operating Runway:</span>
                <span className="text-zinc-300 font-bold">34 Months</span>
              </div>
            </div>
          </div>

          {/* Venture Partners Grid (Span 12) */}
          <div className="md:col-span-12 glass-card rounded-xl p-6 md:p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-white">
                  Institutional Venture Partners
                </h2>
                <p className="text-xs text-[#cbc3d7] font-mono mt-0.5">Tier-1 Syndicate & Lead Investors</p>
              </div>
              <button
                onClick={() => setCapTableModalOpen(true)}
                className="text-zinc-300 hover:text-white transition font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>View Cap Table</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Partner 1: YC */}
              <div
                onClick={() => setCapTableModalOpen(true)}
                className="bg-[#0b0f12] border border-white/10 rounded-xl p-6 flex items-center justify-center h-28 hover:border-white/30 hover:bg-[#101417] transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4d4d8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-display text-3xl font-bold tracking-tighter text-white opacity-80 group-hover:opacity-100 transition-opacity">
                  YC
                </span>
              </div>

              {/* Partner 2: Sequoia */}
              <div
                onClick={() => setCapTableModalOpen(true)}
                className="bg-[#0b0f12] border border-white/10 rounded-xl p-6 flex items-center justify-center h-28 hover:border-white/30 hover:bg-[#101417] transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4d4d8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-display text-xl font-bold tracking-wider text-white opacity-80 group-hover:opacity-100 transition-opacity">
                  SEQUOIA
                </span>
              </div>

              {/* Partner 3: Founders Fund */}
              <div
                onClick={() => setCapTableModalOpen(true)}
                className="bg-[#0b0f12] border border-white/10 rounded-xl p-6 flex items-center justify-center h-28 hover:border-white/30 hover:bg-[#101417] transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4d4d8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-center">
                  <span className="block font-display text-lg font-bold text-white opacity-80 group-hover:opacity-100 transition-opacity leading-none">
                    FOUNDERS
                  </span>
                  <span className="block font-mono text-xs tracking-widest text-[#cbc3d7] opacity-80 group-hover:opacity-100 transition-opacity mt-1">
                    FUND
                  </span>
                </div>
              </div>

              {/* Partner 4: a16z */}
              <div
                onClick={() => setCapTableModalOpen(true)}
                className="bg-[#0b0f12] border border-white/10 rounded-xl p-6 flex items-center justify-center h-28 hover:border-white/30 hover:bg-[#101417] transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4d4d8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-display text-2xl font-bold tracking-tight text-white opacity-80 group-hover:opacity-100 transition-opacity">
                  a16z
                </span>
              </div>
            </div>
          </div>

          {/* Data Room Quick Access (Span 12) */}
          <div className="md:col-span-12 glass-card rounded-xl p-6 md:p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-white">
                  Virtual Data Room // Quick Access
                </h2>
                <p className="text-xs text-[#cbc3d7] font-mono mt-0.5">Encrypted investor diligence vault</p>
              </div>
              <button
                onClick={() => setDataRoomModalOpen(true)}
                className="text-zinc-300 hover:text-white transition font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All 14 Documents</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Doc 1 */}
              <div
                onClick={() => setDataRoomModalOpen(true)}
                className="flex items-center gap-4 p-4 bg-[#0b0f12] border border-white/10 rounded-xl hover:border-white/30 hover:bg-[#101417] transition-all cursor-pointer group"
              >
                <div className="size-10 rounded-lg bg-zinc-800/60 text-zinc-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono text-xs font-bold text-white truncate group-hover:text-white transition-colors">
                    Board_Deck_Q3.pdf
                  </h3>
                  <p className="text-[11px] font-mono text-[#958ea0] mt-0.5">Updated 2 days ago</p>
                </div>
              </div>

              {/* Doc 2 */}
              <div
                onClick={() => setDataRoomModalOpen(true)}
                className="flex items-center gap-4 p-4 bg-[#0b0f12] border border-white/10 rounded-xl hover:border-white/30 hover:bg-[#101417] transition-all cursor-pointer group"
              >
                <div className="size-10 rounded-lg bg-zinc-800/60 text-zinc-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Table className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono text-xs font-bold text-white truncate group-hover:text-white transition-colors">
                    Financial_Model_v4.xlsx
                  </h3>
                  <p className="text-[11px] font-mono text-[#958ea0] mt-0.5">Updated 1 week ago</p>
                </div>
              </div>

              {/* Doc 3 */}
              <div
                onClick={() => setDataRoomModalOpen(true)}
                className="flex items-center gap-4 p-4 bg-[#0b0f12] border border-white/10 rounded-xl hover:border-white/30 hover:bg-[#101417] transition-all cursor-pointer group"
              >
                <div className="size-10 rounded-lg bg-zinc-800/60 text-zinc-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Gavel className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono text-xs font-bold text-white truncate group-hover:text-white transition-colors">
                    Term_Sheet_Draft.pdf
                  </h3>
                  <p className="text-[11px] font-mono text-[#958ea0] mt-0.5">Updated 2 weeks ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Executive Memo Generator View */
        <div className="space-y-6 animate-fade-in">
          <Panel title="Executive Memorandum Generator Inputs">
            <form onSubmit={handleGenerateInvestorUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Venture / Entity Name">
                  <TextInput
                    value={ventureNameInput}
                    onChange={(e) => setVentureNameInput(e.target.value)}
                    placeholder="e.g. Acme SaaS"
                  />
                </Field>
                <Field label="Key Financial Traction">
                  <TextInput
                    value={tractionInput}
                    onChange={(e) => setTractionInput(e.target.value)}
                    placeholder="e.g. $12.4M ARR (+145% YoY)"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company Overview">
                  <TextArea
                    rows={2}
                    value={overviewInput}
                    onChange={(e) => setOverviewInput(e.target.value)}
                    placeholder="Core mission and market problem"
                  />
                </Field>
                <Field label="Key Engineering Milestones">
                  <TextArea
                    rows={2}
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    placeholder="Technical velocity completed this quarter"
                  />
                </Field>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={generating}
                  className="btn-system text-white font-mono font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="size-4" />
                  <span>{generating ? "Drafting Executive Memo..." : "Generate Executive Memo"}</span>
                </button>
              </div>
            </form>
          </Panel>

          {/* Formatted Letter Output */}
          {updateDoc && (
            <Panel title="Generated Executive Update Memorandum">
              <div className="space-y-3">
                <textarea
                  rows={12}
                  value={editableLetter}
                  onChange={(e) => setEditableLetter(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0E131C] p-4 text-xs font-mono text-[#F5F8FC] focus:border-white/40 focus:outline-none leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <CopyButton content={editableLetter} />
                </div>
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
        <Button
          variant="outline"
          onClick={() => {
            update((v) => ({ ...v }));
            toast.success("Investor Telemetry state saved.");
          }}
        >
          Save Telemetry State
        </Button>

        <LinkButton to="/workspace/idea-validation" variant="primary">
          <span>Return to Workspace Overview</span>
          <ArrowRight className="size-4 ml-1" />
        </LinkButton>
      </div>

      {/* Cap Table Modal */}
      <CapTableModal
        isOpen={capTableModalOpen}
        onClose={() => setCapTableModalOpen(false)}
        ventureName={venture?.name || "Active Venture"}
      />

      {/* Virtual Data Room Modal */}
      <DataRoomModal
        isOpen={dataRoomModalOpen}
        onClose={() => setDataRoomModalOpen(false)}
        ventureName={venture?.name || "Active Venture"}
      />
    </div>
  );
}