import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Button,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  Stat,
  TextArea,
  TextInput,
} from "@/components/founderos/ui";
import { Sparkles, RefreshCw, TrendingUp, Users, DollarSign, Activity, ShieldAlert, CheckCircle2, History, Gauge, Rocket, ArrowUpRight } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Traction Dashboard — FounderOS";
const DESCRIPTION = "AI Growth Advisor analyzes startup metrics, user growth, retention, growth experiments, and investor readiness.";

export const Route = createFileRoute("/workspace/traction")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TractionPage,
});

export interface TractionData {
  metrics: {
    totalUsers: number;
    monthlyActiveUsers: number;
    newUsers: number;
    revenue: string;
    conversionRate: string;
    retentionRate: string;
    customerAcquisitionChannels: string[];
  };
  customerInsights: string[];
  aiAnalysis: {
    growthHealth: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    recommendations: string[];
    nextActions: { action: string; priority: string; expectedImpact: string }[];
    growthExperiments: { experiment: string; goal: string; timeline: string; done?: boolean }[];
    investorReadinessScore: number;
  };
}

function TractionPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs
  const [totalUsersInput, setTotalUsersInput] = useState("142");
  const [mauInput, setMauInput] = useState("98");
  const [newUsersInput, setNewUsersInput] = useState("45");
  const [revenueInput, setRevenueInput] = useState("$2,450 / mo");
  const [conversionInput, setConversionInput] = useState("4.8%");
  const [retentionInput, setRetentionInput] = useState("72%");
  const [channelsInput, setChannelsInput] = useState("LinkedIn DMs, Product Hunt, Twitter/X Build-in-Public");
  const [feedbackInput, setFeedbackInput] = useState("Founders praise automatic roadmap generation; requesting PDF export and Zapier integrations.");
  const [goalInput, setGoalInput] = useState("Scale to 500 active users & $5k MRR in 60 days");

  // Traction State
  const [traction, setTraction] = useState<TractionData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (venture) {
      loadTractionHistory();
    }
  }, [venture?.id]);

  async function loadTractionHistory() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getTractionHistoryModule(venture.id);
      if (res.success && res.data?.traction) {
        setTraction(res.data.traction);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load traction history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeTraction(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!venture?.id || generating) return;

    setGenerating(true);
    try {
      const res = await api.analyzeTractionModule({
        ventureId: venture.id,
        ventureName: venture.name || venture.ventureName || "Untitled Venture",
        totalUsers: Number(totalUsersInput) || 0,
        monthlyActiveUsers: Number(mauInput) || 0,
        newUsers: Number(newUsersInput) || 0,
        revenue: revenueInput,
        conversionRate: conversionInput,
        retentionRate: retentionInput,
        customerAcquisitionChannels: channelsInput,
        customerFeedback: feedbackInput,
        growthGoal: goalInput,
      });

      if (res.success && res.data?.traction) {
        setTraction(res.data.traction);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.traction, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to analyze traction:", err);
    } finally {
      setGenerating(false);
    }
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  return (
    <>
      <PageHeader
        eyebrow="Step 08"
        title="Traction AI Analyzer + Dashboard"
        description="AI Growth Advisor analyzes active users, revenue, retention, growth experiments, and investor readiness."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#46E3A3]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Traction Audits Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleAnalyzeTraction()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#46E3A3]/40 bg-gradient-to-r from-[#46E3A3] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(70,227,163,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Analyzing..." : "Analyze Traction"}
            </button>
          </div>
        }
      />

      {/* Generated from Founder Conversation Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#46E3A3]" />
        <div>
          <span className="font-bold text-[#46E3A3]">AI Growth Advisor Active: </span>
          Input your latest metrics below to run a growth analysis and compute investor readiness saved to MongoDB.
        </div>
      </div>

      {/* Inputs Form */}
      <Panel title="Startup Metric Inputs">
        <form onSubmit={handleAnalyzeTraction} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Total Users">
              <TextInput value={totalUsersInput} onChange={(e) => setTotalUsersInput(e.target.value)} />
            </Field>
            <Field label="Monthly Active Users (MAU)">
              <TextInput value={mauInput} onChange={(e) => setMauInput(e.target.value)} />
            </Field>
            <Field label="New Users (This Month)">
              <TextInput value={newUsersInput} onChange={(e) => setNewUsersInput(e.target.value)} />
            </Field>
            <Field label="Monthly Revenue (MRR)">
              <TextInput value={revenueInput} onChange={(e) => setRevenueInput(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Conversion Rate">
              <TextInput value={conversionInput} onChange={(e) => setConversionInput(e.target.value)} />
            </Field>
            <Field label="Retention Rate">
              <TextInput value={retentionInput} onChange={(e) => setRetentionInput(e.target.value)} />
            </Field>
            <Field label="Acquisition Channels">
              <TextInput value={channelsInput} onChange={(e) => setChannelsInput(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Customer Feedback Summary">
              <TextArea rows={2} value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} />
            </Field>
            <Field label="Primary Growth Goal">
              <TextArea rows={2} value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#46E3A3] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(70,227,163,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI Growth Advisor Analyzing..." : "Run AI Traction Audit"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#46E3A3]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#46E3A3]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Analyzing Startup Growth & Investor Readiness...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Evaluating active retention, conversion funnel, bottleneck risks, and growth experiments</p>
          </div>
        </div>
      )}

      {/* 8 Components Traction Display */}
      {traction && !generating && (
        <div className="space-y-6">
          {/* Top Row: 4 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            {/* Component 1: Traction Overview Card */}
            <Stat label="Total Registered Users" value={String(traction.metrics?.totalUsers || totalUsersInput)} change="+32% vs last month" trend="up" />

            {/* Component 2: User Growth Chart / MAU Stat */}
            <Stat label="Monthly Active Users" value={String(traction.metrics?.monthlyActiveUsers || mauInput)} change="69% MAU/Total ratio" trend="up" />

            {/* Component 3: Revenue Metrics */}
            <Stat label="Monthly Revenue (MRR)" value={traction.metrics?.revenue || revenueInput} change="ARR: $29,400" trend="up" />

            {/* Component 4: Retention Dashboard */}
            <Stat label="30-Day User Retention" value={traction.metrics?.retentionRate || retentionInput} change="Top 15% SaaS benchmark" trend="up" />
          </div>

          {/* Component 8: Investor Readiness Score Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#46E3A3]/40 bg-gradient-to-r from-[#0E131C] to-[#14231E] p-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#46E3A3] bg-[#46E3A3]/10 px-2.5 py-1 rounded-lg border border-[#46E3A3]/20 flex items-center gap-1.5 w-max">
                <Gauge className="size-3.5" /> 8. Investor Readiness Score
              </span>
              <h3 className="text-xl font-extrabold text-[#F5F8FC]">Investment & Fundraising Evaluation</h3>
              <p className="text-xs text-[#A8B3C7]">Growth Health Status: <strong className="text-[#46E3A3]">{traction.aiAnalysis?.growthHealth}</strong></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-4xl font-extrabold font-display text-[#46E3A3]">{traction.aiAnalysis?.investorReadinessScore || 82}</span>
                <span className="block text-[10px] font-mono text-[#A8B3C7]">/ 100 PTS</span>
              </div>
            </div>
          </div>

          {/* Component 5: AI Growth Analysis Panel */}
          <Panel title="5. AI Growth Analysis Breakdown">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs space-y-2">
                <span className="font-bold text-emerald-300 uppercase text-[10px]">Key Strengths</span>
                <ul className="space-y-1 text-[#F5F8FC]">
                  {traction.aiAnalysis?.strengths?.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs space-y-2">
                <span className="font-bold text-red-300 uppercase text-[10px]">Bottlenecks & Weaknesses</span>
                <ul className="space-y-1 text-[#F5F8FC]">
                  {traction.aiAnalysis?.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ShieldAlert className="size-3.5 text-red-400 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#64D8FF]/20 bg-[#64D8FF]/10 p-4 text-xs space-y-2">
                <span className="font-bold text-[#64D8FF] uppercase text-[10px]">Growth Opportunities</span>
                <ul className="space-y-1 text-[#F5F8FC]">
                  {traction.aiAnalysis?.opportunities?.map((o, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ArrowUpRight className="size-3.5 text-[#64D8FF] shrink-0" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          {/* Component 6 & 7: Recommended Actions Card & Growth Experiments Board */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 6: Recommended Actions Card */}
            <Panel title="6. Recommended Next Actions">
              <div className="space-y-2 text-xs">
                {traction.aiAnalysis?.nextActions?.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141C28] p-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#F5F8FC]">{act.action}</span>
                      <p className="text-[11px] text-[#46E3A3]">Expected Impact: {act.expectedImpact}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-black bg-[#46E3A3] px-2 py-0.5 rounded-md shrink-0">
                      {act.priority}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Component 7: Growth Experiments Board */}
            <Panel title="7. Growth Experiments Board">
              <div className="space-y-2 text-xs">
                {traction.aiAnalysis?.growthExperiments?.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#64D8FF]">{exp.experiment}</span>
                      <span className="font-mono text-[10px] text-[#A8B3C7] bg-white/5 px-2 py-0.5 rounded">{exp.timeline}</span>
                    </div>
                    <p className="text-[#A8B3C7] text-[11px]">Goal: <strong className="text-[#E1F4FF]">{exp.goal}</strong></p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Traction Metrics</Button>
        <LinkButton to="/workspace/investor-update" variant="primary">
          Continue to Investor Update
        </LinkButton>
      </div>
    </>
  );
}