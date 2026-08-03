import React, { useState, useEffect } from "react";
import { FileText, X, Sparkles, History, CheckCircle, RefreshCw, ShieldAlert } from "lucide-react";
import api from "@/lib/api";
import { useActiveVenture } from "@/lib/founderos/store";

export interface ReportItem {
  _id?: string;
  ventureId: string;
  title: string;
  type: string;
  content: string;
  confidenceScore: number;
  lastUpdated: string;
  version: number;
  changeExplanation?: string;
}

const REPORT_TYPES = [
  { type: "venture_brief", label: "Venture Brief", icon: "📋" },
  { type: "validation_report", label: "Validation Report", icon: "📊" },
  { type: "customer_persona", label: "Customer Persona", icon: "👤" },
  { type: "competitor_analysis", label: "Competitor Analysis", icon: "🎯" },
  { type: "mvp_scope", label: "MVP Scope", icon: "⚡" },
  { type: "gtm_plan", label: "Go-To-Market Plan", icon: "🚀" },
  { type: "investor_summary", label: "Investor Summary", icon: "💼" },
];

interface ReportsDrawerProps {
  open: boolean;
  onClose: () => void;
  initialReports?: ReportItem[];
}

export const ReportsDrawer: React.FC<ReportsDrawerProps> = ({ open, onClose, initialReports }) => {
  const { venture } = useActiveVenture();
  const [activeType, setActiveType] = useState<string>("venture_brief");
  const [reportsMap, setReportsMap] = useState<Record<string, ReportItem>>({});
  const [historyList, setHistoryList] = useState<ReportItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Synchronize initialReports if provided
  useEffect(() => {
    if (initialReports && initialReports.length > 0) {
      const map: Record<string, ReportItem> = {};
      initialReports.forEach((r) => {
        map[r.type] = r;
      });
      setReportsMap((prev) => ({ ...prev, ...map }));
    }
  }, [initialReports]);

  // Fetch latest reports for venture when drawer opens
  useEffect(() => {
    if (open && venture?.id) {
      fetchLatestReports();
    }
  }, [open, venture?.id]);

  // Fetch report version history whenever activeType changes
  useEffect(() => {
    if (open && venture?.id && activeType) {
      fetchVersionHistory(activeType);
    }
  }, [open, venture?.id, activeType]);

  async function fetchLatestReports() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getReports(venture.id);
      if (res.success && Array.isArray(res.data?.reports)) {
        const map: Record<string, ReportItem> = {};
        res.data.reports.forEach((r: ReportItem) => {
          map[r.type] = r;
        });
        setReportsMap(map);
      }
    } catch (err) {
      console.warn("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVersionHistory(type: string) {
    if (!venture?.id) return;
    try {
      const res = await api.getReportHistory(venture.id, type);
      if (res.success && Array.isArray(res.data?.history)) {
        setHistoryList(res.data.history);
        if (res.data.history.length > 0) {
          setSelectedVersion(res.data.history[0].version);
        }
      } else {
        setHistoryList([]);
        setSelectedVersion(null);
      }
    } catch {
      setHistoryList([]);
      setSelectedVersion(null);
    }
  }

  async function handleManualGenerate() {
    if (!venture?.id || refreshing) return;
    setRefreshing(true);
    try {
      const res = await api.generateReports(venture.id);
      if (res.success && Array.isArray(res.data?.reports)) {
        const map: Record<string, ReportItem> = {};
        res.data.reports.forEach((r: ReportItem) => {
          map[r.type] = r;
        });
        setReportsMap(map);
        if (activeType) {
          await fetchVersionHistory(activeType);
        }
      }
    } catch (err) {
      console.warn("Report generation error:", err);
    } finally {
      setRefreshing(false);
    }
  }

  if (!open) return null;

  // Active displayed report based on selected version history or latest map
  const currentReportFromHistory = historyList.find((h) => h.version === selectedVersion);
  const activeReport = currentReportFromHistory || reportsMap[activeType];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="flex h-full w-full max-w-4xl flex-col border-l border-white/10 bg-[#0E131C] text-[#F5F8FC] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#141C28]/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#4F8CFF]/20 to-[#64D8FF]/10 border border-[#4F8CFF]/30 text-[#64D8FF]">
              <FileText className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold font-display text-[#F5F8FC] flex items-center gap-2">
                Executive Startup Reports
                <Sparkles className="size-4 text-[#64D8FF]" />
              </h2>
              <p className="text-xs text-[#A8B3C7]">
                Real-time consulting documents generated from your venture memory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void handleManualGenerate()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161F2D] px-3 py-1.5 text-xs font-medium text-[#A8B3C7] transition hover:border-[#64D8FF]/40 hover:text-[#F5F8FC] disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-[#64D8FF]" : ""}`} />
              {refreshing ? "Updating..." : "Refresh Reports"}
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#A8B3C7] transition hover:bg-white/5 hover:text-[#F5F8FC]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar Navigation & Main Report Viewer */}
        <div className="flex flex-1 overflow-hidden">
          {/* Report Type Selector Tabs */}
          <div className="w-64 border-r border-white/10 bg-[#0A0D14] p-3 space-y-1.5 overflow-y-auto">
            <p className="px-3 py-1 text-[11px] font-mono text-[#A8B3C7] uppercase tracking-wider">
              Report Suite (7)
            </p>
            {REPORT_TYPES.map((r) => {
              const active = activeType === r.type;
              const hasDoc = Boolean(reportsMap[r.type]);
              return (
                <button
                  key={r.type}
                  onClick={() => {
                    setActiveType(r.type);
                    setSelectedVersion(null);
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-[#4F8CFF]/20 to-[#64D8FF]/10 text-[#F5F8FC] border border-[#4F8CFF]/40 shadow-sm"
                      : "text-[#A8B3C7] hover:bg-white/5 hover:text-[#F5F8FC]"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{r.icon}</span>
                    <span className="truncate">{r.label}</span>
                  </span>
                  {hasDoc ? (
                    <span className="size-1.5 rounded-full bg-[#46E3A3]" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-white/20" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Report Viewer Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5 bg-[#080A0F]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#A8B3C7]">
                <RefreshCw className="size-6 animate-spin text-[#64D8FF]" />
                <p className="text-xs font-mono">Compiling Executive Consulting Reports…</p>
              </div>
            ) : activeReport ? (
              <>
                {/* Meta Bar: Title, Version, Confidence, Change Explanation */}
                <div className="space-y-3 rounded-2xl border border-white/10 bg-[#141C28]/90 p-4 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F8FC]">{activeReport.title}</h3>
                      <p className="text-xs text-[#A8B3C7] mt-0.5">
                        Type: <span className="font-mono text-[#64D8FF]">{activeReport.type}</span> • Last Updated:{" "}
                        {new Date(activeReport.lastUpdated || Date.now()).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Version Selector */}
                      {historyList.length > 0 ? (
                        <div className="flex items-center gap-1.5 bg-[#0E131C] px-2.5 py-1 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                          <History className="size-3.5 text-[#64D8FF]" />
                          <select
                            value={selectedVersion ?? activeReport.version}
                            onChange={(e) => setSelectedVersion(Number(e.target.value))}
                            className="bg-transparent text-xs text-[#F5F8FC] font-mono outline-none cursor-pointer"
                          >
                            {historyList.map((h) => (
                              <option key={h.version} value={h.version} className="bg-[#141C28] text-white">
                                v{h.version} {h.version === historyList[0].version ? "(Latest)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      {/* Confidence Score Pill */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 text-xs font-mono font-bold text-[#46E3A3]">
                        <CheckCircle className="size-3.5" />
                        {activeReport.confidenceScore}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* Why Content Changed Banner */}
                  {activeReport.changeExplanation ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-3 text-xs text-[#E1F4FF]">
                      <ShieldAlert className="size-4 shrink-0 text-[#64D8FF] mt-0.5" />
                      <div>
                        <span className="font-bold text-[#64D8FF]">Why Report Changed: </span>
                        {activeReport.changeExplanation}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Main Rendered Document Content */}
                <div className="prose prose-invert max-w-none rounded-2xl border border-white/10 bg-[#0E131C] p-6 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-[#4F8CFF]/30 font-sans shadow-inner">
                  {activeReport.content}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-center text-[#A8B3C7]">
                <FileText className="size-8 text-[#4F8CFF]/50" />
                <p className="text-sm font-semibold text-[#F5F8FC]">No report generated for this module yet.</p>
                <p className="text-xs max-w-md">
                  Chat with the FounderOS AI Co-pilot to share your venture details, or click "Refresh Reports" to compile your baseline executive document.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
