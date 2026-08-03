import React, { useState, useEffect } from "react";
import { X, TrendingUp, Sparkles, AlertCircle, MessageSquare, FileText, CheckCircle2, ArrowRight, RefreshCw, Send } from "lucide-react";
import api from "@/lib/api";
import { useActiveVenture } from "@/lib/founderos/store";

export interface GrowthMetricData {
  visitors: number;
  signups: number;
  activatedUsers: number;
  payingCustomers: number;
  customerInterviews: number;
  revenue: number;
  retentionRate: number;
  growthScore: number;
  bottleneck: string;
  weeklyReview: string;
}

export interface GrowthRecommendationData {
  _id: string;
  title: string;
  category: string;
  action: string;
  reasoning: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: string;
}

export interface FeedbackData {
  _id: string;
  rawText: string;
  customerSegment: string;
  theme: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  impact: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
}

interface GrowthDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const GrowthDrawer: React.FC<GrowthDrawerProps> = ({ open, onClose }) => {
  const { venture } = useActiveVenture();
  const [activeTab, setActiveTab] = useState<"metrics" | "recommendations" | "feedback" | "studio">("metrics");

  const [metrics, setMetrics] = useState<GrowthMetricData>({
    visitors: 0,
    signups: 0,
    activatedUsers: 0,
    payingCustomers: 0,
    customerInterviews: 0,
    revenue: 0,
    retentionRate: 0,
    growthScore: 0,
    bottleneck: "Awaiting data",
    weeklyReview: "",
  });

  const [recommendations, setRecommendations] = useState<GrowthRecommendationData[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);

  // Metric Edit State
  const [editingMetrics, setEditingMetrics] = useState<GrowthMetricData>(metrics);
  const [updatingMetrics, setUpdatingMetrics] = useState(false);

  // Feedback Form State
  const [feedbackInput, setFeedbackInput] = useState("");
  const [segmentInput, setSegmentInput] = useState("Early Adopter");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // AI Content Studio State
  const [contentType, setContentType] = useState<"landing_page" | "product_hunt" | "blog_post" | "social_post" | "email_campaign">("landing_page");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [generatingContent, setGeneratingContent] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && venture?.id) {
      fetchGrowthData();
    }
  }, [open, venture?.id]);

  async function fetchGrowthData() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getGrowthData(venture.id);
      if (res.success && res.data?.growth) {
        const g = res.data.growth;
        if (g.metrics) {
          setMetrics(g.metrics);
          setEditingMetrics(g.metrics);
        }
        if (Array.isArray(g.recommendations)) setRecommendations(g.recommendations);
        if (Array.isArray(g.feedback)) setFeedbackList(g.feedback);
      }
    } catch (err) {
      console.warn("Failed to fetch growth data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMetrics(e: React.FormEvent) {
    e.preventDefault();
    if (!venture?.id || updatingMetrics) return;
    setUpdatingMetrics(true);
    try {
      const res = await api.updateGrowthMetrics(venture.id, editingMetrics as any);
      if (res.success && res.data?.growth) {
        if (res.data.growth.metrics) setMetrics(res.data.growth.metrics);
        if (Array.isArray(res.data.growth.recommendations)) setRecommendations(res.data.growth.recommendations);
      }
    } catch (err) {
      console.warn("Failed to update growth metrics:", err);
    } finally {
      setUpdatingMetrics(false);
    }
  }

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!venture?.id || !feedbackInput.trim() || submittingFeedback) return;
    setSubmittingFeedback(true);
    try {
      const res = await api.submitCustomerFeedback(venture.id, {
        rawText: feedbackInput.trim(),
        customerSegment: segmentInput.trim(),
      });
      if (res.success && res.data?.feedback) {
        setFeedbackList((prev) => [res.data.feedback, ...prev]);
        setFeedbackInput("");
      }
    } catch (err) {
      console.warn("Failed to submit customer feedback:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function handleGenerateContent() {
    if (!venture?.id || generatingContent) return;
    setGeneratingContent(true);
    try {
      const res = await api.generateGrowthContent(venture.id, contentType);
      if (res.success && res.data?.content) {
        setGeneratedContent(res.data.content);
      }
    } catch (err) {
      console.warn("Content generation error:", err);
    } finally {
      setGeneratingContent(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="flex h-full w-full max-w-5xl flex-col border-l border-white/10 bg-[#0E131C] text-[#F5F8FC] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#141C28]/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#64D8FF]/20 to-[#4F8CFF]/10 border border-[#64D8FF]/30 text-[#64D8FF]">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold font-display text-[#F5F8FC] flex items-center gap-2">
                FounderOS Growth OS
                <Sparkles className="size-4 text-[#64D8FF]" />
              </h2>
              <p className="text-xs text-[#A8B3C7]">
                Track startup funnel metrics, bottleneck analysis, feedback themes, and AI content studio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void fetchGrowthData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161F2D] px-3 py-1.5 text-xs font-medium text-[#A8B3C7] transition hover:border-[#64D8FF]/40 hover:text-[#F5F8FC]"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-[#64D8FF]" : ""}`} />
              Refresh Data
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#A8B3C7] transition hover:bg-white/5 hover:text-[#F5F8FC]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0A0D14] px-6 gap-2 pt-2">
          {[
            { id: "metrics", label: "Metrics & Funnel", icon: TrendingUp },
            { id: "recommendations", label: "Growth Recommendations", icon: Sparkles },
            { id: "feedback", label: "Feedback Themes", icon: MessageSquare },
            { id: "studio", label: "AI Content Studio", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition ${
                  active
                    ? "bg-[#080A0F] text-[#64D8FF] border-white/10 border-b-[#080A0F] shadow-sm"
                    : "text-[#A8B3C7] border-transparent hover:text-[#F5F8FC] hover:bg-white/5"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#080A0F]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#A8B3C7]">
              <RefreshCw className="size-6 animate-spin text-[#64D8FF]" />
              <p className="text-xs font-mono">Analyzing Growth Metrics…</p>
            </div>
          ) : (
            <>
              {/* TAB 1: METRICS & FUNNEL */}
              {activeTab === "metrics" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Growth Score & Bottleneck Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-5 flex flex-col justify-between shadow-xl">
                      <span className="text-xs font-mono text-[#A8B3C7] uppercase">Growth Health Score</span>
                      <div className="text-4xl font-extrabold font-display text-[#64D8FF] my-2">
                        {metrics.growthScore}<span className="text-base text-[#A8B3C7]">/100</span>
                      </div>
                      <p className="text-[11px] text-[#A8B3C7]">Calculated from active funnel conversion rates.</p>
                    </div>

                    <div className="md:col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex flex-col justify-between shadow-xl">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <AlertCircle className="size-4 text-amber-400" />
                        <span>Growth Bottleneck Analysis</span>
                      </div>
                      <p className="text-xs font-medium text-amber-100 my-2 leading-relaxed">
                        {metrics.bottleneck}
                      </p>
                      <p className="text-[11px] text-amber-300/80">
                        Review AI Recommendations to resolve this operational bottleneck.
                      </p>
                    </div>
                  </div>

                  {/* Funnel Metrics Form */}
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#F5F8FC] uppercase tracking-wider">
                      Startup Funnel Metrics
                    </h3>

                    <form onSubmit={handleSaveMetrics} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { key: "visitors", label: "Visitors", val: editingMetrics.visitors },
                        { key: "signups", label: "Signups", val: editingMetrics.signups },
                        { key: "activatedUsers", label: "Activated Users", val: editingMetrics.activatedUsers },
                        { key: "payingCustomers", label: "Paying Customers", val: editingMetrics.payingCustomers },
                        { key: "customerInterviews", label: "Customer Interviews", val: editingMetrics.customerInterviews },
                        { key: "revenue", label: "Revenue ($)", val: editingMetrics.revenue },
                        { key: "retentionRate", label: "Retention Rate (%)", val: editingMetrics.retentionRate },
                      ].map((field) => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[11px] text-[#A8B3C7] font-medium">{field.label}</label>
                          <input
                            type="number"
                            min="0"
                            value={field.val}
                            onChange={(e) =>
                              setEditingMetrics({
                                ...editingMetrics,
                                [field.key]: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#141C28] px-3 py-2 text-xs text-[#F5F8FC] font-mono outline-none focus:border-[#64D8FF]/50"
                          />
                        </div>
                      ))}

                      <div className="col-span-2 sm:col-span-4 flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={updatingMetrics}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-4" />
                          {updatingMetrics ? "Recalculating..." : "Update Funnel & Recalculate Score"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: GROWTH RECOMMENDATIONS & REASONING */}
              {activeTab === "recommendations" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#64D8FF] uppercase tracking-wider flex items-center gap-2">
                      AI Growth Recommendations & Reasoning ({recommendations.length})
                    </h3>

                    <div className="space-y-3">
                      {recommendations.length === 0 ? (
                        <p className="text-xs text-[#A8B3C7] italic py-6 text-center">No growth recommendations generated yet.</p>
                      ) : (
                        recommendations.map((rec) => (
                          <div key={rec._id} className="rounded-xl border border-white/10 bg-[#141C28] p-4 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold text-[#F5F8FC]">{rec.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#A8B3C7]">
                                  {rec.category}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    rec.priority === "HIGH"
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {rec.priority}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-[#E1F4FF]"><span className="font-semibold text-[#64D8FF]">Action: </span>{rec.action}</p>

                            {/* Reasoning Box */}
                            <div className="rounded-lg border border-[#64D8FF]/20 bg-[#64D8FF]/5 p-2.5 text-[11px] text-[#A8B3C7] leading-relaxed">
                              <span className="font-bold text-[#64D8FF]">Why this matters (Reasoning): </span>
                              {rec.reasoning}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMER FEEDBACK ANALYZER */}
              {activeTab === "feedback" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Feedback Input Form */}
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#F5F8FC] uppercase tracking-wider">
                      Submit Customer Feedback to Analyze
                    </h3>

                    <form onSubmit={handleSubmitFeedback} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Customer Segment (e.g. Early SaaS Founder, Designer)"
                          value={segmentInput}
                          onChange={(e) => setSegmentInput(e.target.value)}
                          className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-[#141C28] px-3 py-2 text-xs text-[#F5F8FC] outline-none"
                        />
                        <textarea
                          placeholder="Paste raw customer feedback, interview quote, or survey response..."
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          rows={2}
                          className="w-full sm:w-2/3 rounded-xl border border-white/10 bg-[#141C28] px-3 py-2 text-xs text-[#F5F8FC] outline-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingFeedback || !feedbackInput.trim()}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-50"
                        >
                          <Send className="size-3.5" />
                          {submittingFeedback ? "Grouping Theme..." : "Analyze & Group Theme"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Feedback Entries List */}
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-3 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#F5F8FC] uppercase tracking-wider">
                      Grouped Feedback Themes ({feedbackList.length})
                    </h3>

                    {feedbackList.length === 0 ? (
                      <p className="text-xs text-[#A8B3C7] italic py-6 text-center">No customer feedback analyzed yet.</p>
                    ) : (
                      feedbackList.map((f) => (
                        <div key={f._id} className="rounded-xl border border-white/10 bg-[#141C28] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#64D8FF]/10 text-[#64D8FF] border border-[#64D8FF]/20 font-bold">
                              Theme: {f.theme}
                            </span>
                            <p className="text-xs text-[#F5F8FC] mt-2">"{f.rawText}"</p>
                            <p className="text-[10px] text-[#A8B3C7] mt-1">Segment: {f.customerSegment}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                f.sentiment === "POSITIVE"
                                  ? "bg-green-500/20 text-green-400"
                                  : f.sentiment === "NEGATIVE"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-300"
                              }`}
                            >
                              {f.sentiment}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#A8B3C7]">
                              Impact: {f.impact}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AI CONTENT STUDIO */}
              {activeTab === "studio" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="rounded-2xl border border-white/10 bg-[#0E131C] p-6 space-y-4 shadow-xl">
                    <h3 className="text-sm font-bold font-mono text-[#64D8FF] uppercase tracking-wider flex items-center gap-2">
                      AI Content Studio
                    </h3>

                    {/* Content Channel Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: "landing_page", label: "Landing Page" },
                        { id: "product_hunt", label: "Product Hunt" },
                        { id: "blog_post", label: "Blog Post" },
                        { id: "social_post", label: "Social Posts" },
                        { id: "email_campaign", label: "Email Campaign" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setContentType(c.id as any)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                            contentType === c.id
                              ? "bg-[#64D8FF]/20 border-[#64D8FF] text-[#F5F8FC]"
                              : "border-white/10 bg-[#141C28] text-[#A8B3C7] hover:text-[#F5F8FC]"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => void handleGenerateContent()}
                        disabled={generatingContent}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Sparkles className={`size-4 ${generatingContent ? "animate-spin" : ""}`} />
                        {generatingContent ? "Generating Copy..." : `Generate ${contentType.replace("_", " ").toUpperCase()} Copy`}
                      </button>
                    </div>

                    {/* Generated Copy Viewer */}
                    {generatedContent ? (
                      <div className="prose prose-invert max-w-none rounded-2xl border border-white/10 bg-[#080A0F] p-6 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap selection:bg-[#64D8FF]/30">
                        {generatedContent}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl text-[#A8B3C7] gap-2">
                        <FileText className="size-6 text-[#64D8FF]" />
                        <p className="text-xs">Click generate to produce tailored marketing copy based on venture memory.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
