import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Button,
  Empty,
  PageHeader,
  Panel,
  Progress,
  Stat,
} from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Gauge, Activity, ShieldAlert, ArrowUpRight, CheckCircle2, History, Layers, Rocket, TrendingUp, DollarSign, LineChart } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Venture Intelligence — FounderOS";
const DESCRIPTION = "Venture Intelligence Command Center provides overall startup health score, current stage, risk monitor, and priority actions.";

export const Route = createFileRoute("/workspace/intelligence")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IntelligencePage,
});

export interface VentureIntelligenceData {
  healthScore: number;
  startupStage: string;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    opportunities: string[];
    priorityActions: { action: string; priority: string; reason: string }[];
  };
  metrics: {
    validationScore: number;
    productProgress: number;
    marketingScore: number;
    tractionScore: number;
    investorScore: number;
  };
}

export function IntelligencePage() {
  const { venture } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [intelData, setIntelData] = useState<VentureIntelligenceData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (venture?.id) {
      loadIntelligenceHistory();
    }
  }, [venture?.id]);

  async function loadIntelligenceHistory() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getIntelligenceHistoryModule(venture.id);
      if (res.success && res.data?.intelligence) {
        setIntelData(res.data.intelligence);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load venture intelligence history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunIntelligenceAudit() {
    if (!venture?.id || generating) return;

    setGenerating(true);
    try {
      const res = await api.analyzeVentureIntelligenceModule({
        ventureId: venture.id,
        ventureName: venture.name || venture.ventureName || "Untitled Venture",
      });

      if (res.success && res.data?.intelligence) {
        setIntelData(res.data.intelligence);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.intelligence, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to analyze venture intelligence:", err);
    } finally {
      setGenerating(false);
    }
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  return (
    <>
      <PageHeader
        eyebrow="Command Center"
        title="Venture Intelligence Dashboard"
        description="Comprehensive startup health score, stage indicator, risk monitor, and priority action queue aggregated across 7 modules."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#46E3A3]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Audits Completed</span>
              </div>
            )}

            <button
              onClick={() => void handleRunIntelligenceAudit()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#46E3A3]/40 bg-gradient-to-r from-[#46E3A3] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(70,227,163,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Auditing Venture..." : "Run Intelligence Audit"}
            </button>
          </div>
        }
      />

      {/* Generated from Founder Conversation Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#46E3A3]" />
        <div>
          <span className="font-bold text-[#46E3A3]">AI Operating Advisor Active: </span>
          Real-time command center analyzing your startup health score, current stage, and top priority founder actions.
        </div>
      </div>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#46E3A3]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#46E3A3]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Analyzing Full Venture Operating Health...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Aggregating Idea Validation, MVP Scope, Build Roadmap, Marketing, Launch, Traction, and Investor Updates</p>
          </div>
        </div>
      )}

      {/* 7 Components Command Center Display */}
      {intelData && !generating && (
        <div className="space-y-6">
          {/* Top Banner: Component 1 & 2: Health Score Gauge & Venture Stage Indicator */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Component 1: Startup Health Score */}
            <div className="sm:col-span-2 rounded-2xl border border-[#46E3A3]/40 bg-gradient-to-r from-[#0E131C] to-[#14231E] p-6 shadow-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#46E3A3] bg-[#46E3A3]/10 px-2.5 py-1 rounded-lg border border-[#46E3A3]/20 flex items-center gap-1.5 w-max">
                  <Gauge className="size-3.5" /> 1. Startup Health Score
                </span>
                <h3 className="text-2xl font-extrabold text-[#F5F8FC]">Operating Health Rating</h3>
                <p className="text-xs text-[#A8B3C7]">Composite evaluation across 7 workspace AI models</p>
              </div>

              <div className="text-center bg-[#0E131C] p-4 rounded-2xl border border-[#46E3A3]/30">
                <span className="text-5xl font-extrabold font-display text-[#46E3A3]">{intelData.healthScore}</span>
                <span className="block text-[10px] font-mono text-[#A8B3C7] mt-1">/ 100 PTS</span>
              </div>
            </div>

            {/* Component 2: Venture Stage Indicator */}
            <div className="rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C] p-6 shadow-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20 w-max">
                2. Venture Stage Indicator
              </span>
              <div className="py-2">
                <span className="text-xs font-mono text-[#A8B3C7] block uppercase">Current Phase</span>
                <h4 className="text-lg font-extrabold text-[#F5F8FC] mt-0.5">{intelData.startupStage}</h4>
              </div>
              <span className="text-xs font-mono text-[#46E3A3] bg-[#46E3A3]/10 px-3 py-1 rounded-xl border border-[#46E3A3]/20 w-max">
                Status: Active Execution
              </span>
            </div>
          </div>

          {/* Component 6: Startup Radar & Sub-Score Progress Bars */}
          <Panel title="6. Venture Sub-Scores & Progress Timeline">
            <div className="grid gap-4 sm:grid-cols-5">
              <div>
                <Progress value={intelData.metrics?.validationScore || 85} label="Validation Score" />
              </div>
              <div>
                <Progress value={intelData.metrics?.productProgress || 75} label="Product Progress" />
              </div>
              <div>
                <Progress value={intelData.metrics?.marketingScore || 70} label="Marketing Score" />
              </div>
              <div>
                <Progress value={intelData.metrics?.tractionScore || 80} label="Traction Score" />
              </div>
              <div>
                <Progress value={intelData.metrics?.investorScore || 78} label="Investor Score" />
              </div>
            </div>
          </Panel>

          {/* Component 7: Founder Action Queue */}
          <Panel title="7. Founder Priority Action Queue (Top 5 Actions)">
            <div className="space-y-3">
              {intelData.analysis?.priorityActions?.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="size-6 rounded-lg bg-gradient-to-br from-[#4F8CFF] to-[#64D8FF] text-black font-extrabold font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-[#F5F8FC]">{act.action}</h4>
                      <p className="text-[11px] text-[#A8B3C7]">{act.reason}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-black bg-[#46E3A3] px-2.5 py-1 rounded-md shrink-0">
                    {act.priority}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Component 4 & 5: Risk Monitor Panel & Opportunity Board */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 4: Risk Monitor */}
            <Panel title="4. Operating Risk Monitor">
              <ul className="space-y-2 text-xs">
                {intelData.analysis?.risks?.map((r, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <ShieldAlert className="size-4 text-red-400 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Component 5: Opportunity Board */}
            <Panel title="5. Strategic Opportunity Board">
              <ul className="space-y-2 text-xs">
                {intelData.analysis?.opportunities?.map((o, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[#E1F4FF] bg-[#64D8FF]/10 p-3 rounded-xl border border-[#64D8FF]/20">
                    <ArrowUpRight className="size-4 text-[#64D8FF] shrink-0" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Component 3: AI Recommendations (Strengths & Weaknesses) */}
          <Panel title="3. AI Operating Analysis & Recommendations">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#46E3A3]">Venture Strengths</span>
                <ul className="space-y-1.5 text-xs text-[#F5F8FC]">
                  {intelData.analysis?.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-[#141C28] p-2.5 rounded-xl border border-white/5">
                      <CheckCircle2 className="size-3.5 text-[#46E3A3] shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">Areas for Improvement</span>
                <ul className="space-y-1.5 text-xs text-[#F5F8FC]">
                  {intelData.analysis?.weaknesses?.map((w, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-[#141C28] p-2.5 rounded-xl border border-white/5">
                      <ShieldAlert className="size-3.5 text-amber-400 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
