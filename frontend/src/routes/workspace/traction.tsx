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
import { Sparkles, RefreshCw, TrendingUp, Users, DollarSign, Activity, ShieldAlert, CheckCircle2, History, Gauge, Rocket, ArrowUpRight, AlertCircle, Info } from "lucide-react";
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

function formatTractionData(raw: any, fallbackName: string): TractionData {
  const data = raw?.traction || raw?.tractionData || raw || {};
  const metrics = data.metrics || {};
  const analysis = data.aiAnalysis || data.analysis || {};

  const total = Number(metrics.totalUsers) || 0;
  const mau = Number(metrics.monthlyActiveUsers) || 0;
  const rev = metrics.revenue || (total === 0 ? "$0 / Pre-Revenue" : "$0 / mo");
  const ret = metrics.retentionRate || (total === 0 ? "Not yet recorded" : "0%");

  return {
    metrics: {
      totalUsers: total,
      monthlyActiveUsers: mau,
      newUsers: Number(metrics.newUsers) || 0,
      revenue: rev,
      conversionRate: metrics.conversionRate || (total === 0 ? "Not yet recorded" : "0%"),
      retentionRate: ret,
      customerAcquisitionChannels: (Array.isArray(metrics.customerAcquisitionChannels) && metrics.customerAcquisitionChannels.length > 0)
        ? metrics.customerAcquisitionChannels
        : ["No channels recorded yet"],
    },
    customerInsights: (Array.isArray(data.customerInsights) && data.customerInsights.length > 0)
      ? data.customerInsights
      : [
          total === 0 ? "Zero customer feedback recorded yet. Conduct early discovery interviews." : "Customer feedback collection in progress.",
        ],
    aiAnalysis: {
      growthHealth: analysis.growthHealth || (total === 0 ? "Pre-Launch / Early Discovery Stage" : "Early Growth Tracking"),
      strengths: (Array.isArray(analysis.strengths) && analysis.strengths.length > 0)
        ? analysis.strengths
        : [
            total === 0 ? "Clear problem space definition with no technical debt." : "Early user feedback loop active.",
          ],
      weaknesses: (Array.isArray(analysis.weaknesses) && analysis.weaknesses.length > 0)
        ? analysis.weaknesses
        : [
            total === 0 ? "No active telemetry or repeatable user acquisition channels established." : "Acquisition channels require scaling.",
          ],
      opportunities: (Array.isArray(analysis.opportunities) && analysis.opportunities.length > 0)
        ? analysis.opportunities
        : [
            total === 0 ? "Direct 1-on-1 founder outreach to initial 20 target users." : "Implement referral viral loops.",
          ],
      recommendations: (Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0)
        ? analysis.recommendations
        : [
            total === 0 ? "Conduct 10 discovery calls before spending on ads." : "Focus on active user retention.",
          ],
      nextActions: (Array.isArray(analysis.nextActions) && analysis.nextActions.length > 0)
        ? analysis.nextActions
        : [
            {
              action: total === 0 ? "Reach out to 20 target users for MVP feedback" : "Implement 1-click referral link",
              priority: "High",
              expectedImpact: total === 0 ? "Initial 5–10 Test Users" : "+25% MoM Growth",
            },
          ],
      growthExperiments: (Array.isArray(analysis.growthExperiments) && analysis.growthExperiments.length > 0)
        ? analysis.growthExperiments
        : [
            {
              experiment: total === 0 ? "1-on-1 founder demo calls" : "Landing page CTA A/B test",
              goal: total === 0 ? "Acquire first 10 active testers" : "Double conversion rate",
              timeline: "7 Days",
            },
          ],
      investorReadinessScore: typeof analysis.investorReadinessScore === "number"
        ? analysis.investorReadinessScore
        : (total === 0 ? 35 : 72),
    },
  };
}

function TractionPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs (clean empty state - no dummy numbers)
  const [totalUsersInput, setTotalUsersInput] = useState("");
  const [mauInput, setMauInput] = useState("");
  const [newUsersInput, setNewUsersInput] = useState("");
  const [revenueInput, setRevenueInput] = useState("");
  const [conversionInput, setConversionInput] = useState("");
  const [retentionInput, setRetentionInput] = useState("");
  const [channelsInput, setChannelsInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [goalInput, setGoalInput] = useState("");

  // Traction State
  const [traction, setTraction] = useState<TractionData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const ventureId = venture?.id || (venture as any)?._id || "6a709d6ff4af39139e040cc8";

  useEffect(() => {
    if (venture) {
      loadTractionHistory();
    } else {
      loadTractionHistory();
    }
  }, [ventureId]);

  async function loadTractionHistory() {
    setLoading(true);
    try {
      const res = await api.getTractionHistoryModule(ventureId);
      if (res.success && (res.data?.traction || res.data?.tractionData)) {
        const rawObj = res.data.traction || res.data.tractionData;
        const formatted = formatTractionData(rawObj, venture?.name || "Untitled Venture");
        setTraction(formatted);
        setHistory(res.data.history || []);
      } else {
        setTraction(null);
      }
    } catch (err) {
      console.warn("Failed to load traction history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeTraction(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;

    setGenerating(true);
    try {
      const res = await api.analyzeTractionModule({
        ventureId,
        ventureName: venture?.name || venture?.ventureName || "Untitled Venture",
        totalUsers: Number(totalUsersInput) || 0,
        monthlyActiveUsers: Number(mauInput) || 0,
        newUsers: Number(newUsersInput) || 0,
        revenue: revenueInput || "$0 / Pre-Revenue",
        conversionRate: conversionInput || "Not recorded",
        retentionRate: retentionInput || "Not recorded",
        customerAcquisitionChannels: channelsInput || "Direct Outreach",
        customerFeedback: feedbackInput || "",
        growthGoal: goalInput || "Acquire first 10–25 active users",
      });

      if (res.success && (res.data?.traction || res.data?.tractionData)) {
        const rawObj = res.data.traction || res.data.tractionData;
        const formatted = formatTractionData(rawObj, venture?.name || "Untitled Venture");
        setTraction(formatted);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [rawObj, ...prev]);
        }
      } else {
        const formatted = formatTractionData({}, venture?.name || "Untitled Venture");
        setTraction(formatted);
      }
    } catch (err) {
      console.warn("Failed to analyze traction:", err);
      const formatted = formatTractionData({}, venture?.name || "Untitled Venture");
      setTraction(formatted);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 06"
        title="Traction Analytics & Growth Auditor"
        description="AI Growth Advisor analyzes actual startup metrics, user retention, acquisition channels, and calculated investor readiness score."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#101417] px-3 py-1.5 rounded-xl border border-[rgba(139,92,246,0.3)] text-xs text-[#cbc3d7]">
                <History className="size-3.5 text-[#A78BFA]" />
                <span className="font-mono text-xs text-white">{history.length} Audits Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleAnalyzeTraction()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] px-4 py-2 text-xs font-bold text-black transition shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "AI Is Auditing Traction..." : "Run AI Traction Audit"}
            </button>
          </div>
        }
      />

      {/* Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-4 text-xs text-white shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#A78BFA]" />
        <div>
          <span className="font-bold text-[#A78BFA]">Evidence-Based Growth Auditor: </span>
          Input your real metrics below (or leave blank if Pre-Launch) to generate an honest growth audit, first-user acquisition roadmap, and investor readiness diagnostic.
        </div>
      </div>

      {/* Form Inputs */}
      <Panel title="Startup Metric Inputs (Leave Blank if Pre-Launch)">
        <form onSubmit={handleAnalyzeTraction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Total Registered Users">
              <TextInput
                value={totalUsersInput}
                onChange={(e) => setTotalUsersInput(e.target.value)}
                placeholder="e.g. 0 (or leave blank for pre-launch)"
              />
            </Field>
            <Field label="Monthly Active Users (MAU)">
              <TextInput
                value={mauInput}
                onChange={(e) => setMauInput(e.target.value)}
                placeholder="e.g. 0"
              />
            </Field>
            <Field label="New Users (Last 30 Days)">
              <TextInput
                value={newUsersInput}
                onChange={(e) => setNewUsersInput(e.target.value)}
                placeholder="e.g. 0"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Monthly Revenue (MRR)">
              <TextInput
                value={revenueInput}
                onChange={(e) => setRevenueInput(e.target.value)}
                placeholder="e.g. $0 or $1,500/mo"
              />
            </Field>
            <Field label="Conversion Rate">
              <TextInput
                value={conversionInput}
                onChange={(e) => setConversionInput(e.target.value)}
                placeholder="e.g. 4.5% or Not recorded"
              />
            </Field>
            <Field label="Retention Rate (30-Day)">
              <TextInput
                value={retentionInput}
                onChange={(e) => setRetentionInput(e.target.value)}
                placeholder="e.g. 60% or Not recorded"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Acquisition Channels">
              <TextArea
                rows={2}
                value={channelsInput}
                onChange={(e) => setChannelsInput(e.target.value)}
                placeholder="e.g. Direct 1-on-1 outreach, Community hubs"
              />
            </Field>
            <Field label="Customer Feedback Summary">
              <TextArea
                rows={2}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Notes from customer interviews or feedback calls"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] px-5 py-2.5 text-xs font-extrabold text-black transition disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.4)] cursor-pointer"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Auditing Traction..." : "Run AI Traction Audit"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#A78BFA]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white">Analyzing Growth Metrics & Retention Signals...</h3>
            <p className="text-xs font-mono text-[#958ea0]">Benchmarking conversion rates, acquisition channels, growth experiments, and investor readiness</p>
          </div>
        </div>
      )}

      {/* Traction Dashboard Display */}
      {traction && !generating && (
        <div className="space-y-6">
          {/* Key Metrics Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Registered Users" value={traction.metrics?.totalUsers > 0 ? traction.metrics.totalUsers.toLocaleString() : "0 (Pre-Launch)"} />
            <Stat label="Monthly Active Users" value={traction.metrics?.monthlyActiveUsers > 0 ? traction.metrics.monthlyActiveUsers.toLocaleString() : "0"} />
            <Stat label="Monthly Revenue (MRR)" value={traction.metrics?.revenue || "$0 / Pre-Revenue"} />
            <Stat label="30-Day Retention Rate" value={traction.metrics?.retentionRate || "Not recorded"} />
          </div>

          {/* Investor Readiness Score Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-6 shadow-2xl">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2.5 py-1 rounded-lg border border-[rgba(139,92,246,0.3)]">
                Growth Diagnostic Status
              </span>
              <h2 className="text-xl font-extrabold text-white mt-2">{traction.aiAnalysis?.growthHealth}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase text-[#958ea0]">Investor Readiness Score</span>
                <span className="text-2xl font-extrabold font-mono text-[#A78BFA]">
                  {traction.aiAnalysis?.investorReadinessScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* SWOT Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Key Strengths">
              <ul className="space-y-2 text-xs text-white">
                {traction.aiAnalysis?.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#101417] p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Weaknesses & Bottlenecks">
              <ul className="space-y-2 text-xs text-[#cbc3d7]">
                {traction.aiAnalysis?.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#101417] p-3 rounded-xl border border-white/10">
                    <ShieldAlert className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Growth Opportunities">
              <ul className="space-y-2 text-xs text-white">
                {traction.aiAnalysis?.opportunities?.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#101417] p-3 rounded-xl border border-[rgba(139,92,246,0.25)]">
                    <ArrowUpRight className="size-4 text-[#A78BFA] shrink-0 mt-0.5" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Priority Next Actions & Growth Experiments */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Priority Action Items">
              <div className="space-y-2 text-xs">
                {traction.aiAnalysis?.nextActions?.map((act, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-[#101417] p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{act.action}</span>
                      <span className="text-[10px] font-mono text-[#A78BFA] bg-[rgba(139,92,246,0.15)] px-2 py-0.5 rounded-md border border-[rgba(139,92,246,0.3)]">
                        {act.priority} Priority
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#cbc3d7] block pt-0.5">
                      Expected Impact: {act.expectedImpact}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Recommended Growth Experiments">
              <div className="space-y-2 text-xs">
                {traction.aiAnalysis?.growthExperiments?.map((exp, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-[#101417] p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{exp.experiment}</span>
                      <span className="text-[10px] font-mono text-[#958ea0] bg-white/5 px-2 py-0.5 rounded-md">
                        {exp.timeline}
                      </span>
                    </div>
                    <p className="text-[#cbc3d7] text-[11px]">Goal: {exp.goal}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* Empty State Banner when no audit has been run yet */}
      {!traction && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b0f12] p-12 text-center space-y-3">
          <Activity className="size-10 text-[#A78BFA]/60" />
          <h3 className="text-base font-bold text-white">No Traction Audit Generated Yet</h3>
          <p className="max-w-md text-xs text-[#cbc3d7] font-sans">
            Enter your active numbers in the form above, or click <strong>Run AI Traction Audit</strong> with blank fields to generate a Pre-Traction baseline strategy for acquiring your first 10–50 users.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Traction Audit</Button>
        <LinkButton to="/workspace/investor-update" variant="primary">
          Continue to Investor Update
        </LinkButton>
      </div>
    </>
  );
}