import React, { useState } from "react";
import { X, Radio, ArrowUpRight, CheckCircle2, Sparkles, Filter, RefreshCw, MessageSquare, ExternalLink } from "lucide-react";

export interface SignalItem {
  id: string;
  source: "Reddit" | "HackerNews" | "X / Twitter" | "ProductHunt" | "Discord";
  community: string;
  author: string;
  snippet: string;
  painScore: number; // 1-100
  timeAgo: string;
  sentiment: "HIGH_FRICTION" | "WORKAROUND_SEEKING" | "WILLING_TO_PAY";
  vectors: string[];
}

const SAMPLE_SIGNALS: SignalItem[] = [
  {
    id: "sig-1",
    source: "HackerNews",
    community: "Ask HN",
    author: "dev_architect",
    snippet: "We spent 3 weeks configuring compliance & auth for our multi-tenant SaaS. Why is there no unified terminal to orchestrate this without 10 different SaaS dashboards?",
    painScore: 94,
    timeAgo: "14m ago",
    sentiment: "WILLING_TO_PAY",
    vectors: ["AUTH_FRICTION", "MULTI_TENANT_ORCHESTRATION"],
  },
  {
    id: "sig-2",
    source: "Reddit",
    community: "r/SaaS",
    author: "founder_scale",
    snippet: "Our churn jumped by 4% because we didn't have real-time alerts on user usage drops before invoice date. Looking for an autonomous telemetry hook.",
    painScore: 89,
    timeAgo: "42m ago",
    sentiment: "HIGH_FRICTION",
    vectors: ["RETENTION_ALERT", "TELEMETRY_HOOK"],
  },
  {
    id: "sig-3",
    source: "X / Twitter",
    community: "Tech Founder Space",
    author: "@sarah_builds",
    snippet: "Writing customer interview summaries by hand in Notion is the bottleneck for our seed-stage validation. Need an AI coach that synthesizes customer quotes automatically.",
    painScore: 92,
    timeAgo: "1h ago",
    sentiment: "WORKAROUND_SEEKING",
    vectors: ["INTERVIEW_NLP", "CUSTOMER_VALIDATION"],
  },
  {
    id: "sig-4",
    source: "ProductHunt",
    community: "Discussions",
    author: "alex_product",
    snippet: "Most roadmapping tools are just glorified Jira tickets. We need an OS that actively tells us what NOT to build for our MVP sprint.",
    painScore: 86,
    timeAgo: "2h ago",
    sentiment: "HIGH_FRICTION",
    vectors: ["MVP_PRUNING", "VELOCITY_GUARD"],
  },
];

interface SignalRadarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSignalVector?: (vector: string) => void;
}

export const SignalRadarDrawer: React.FC<SignalRadarDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSignalVector,
}) => {
  const [signals, setSignals] = useState<SignalItem[]>(SAMPLE_SIGNALS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [lockedVector, setLockedVector] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSignals((prev) => [
        {
          id: `sig-${Date.now()}`,
          source: "HackerNews",
          community: "Show HN",
          author: `builder_${Math.floor(Math.random() * 900 + 100)}`,
          snippet: "Just open-sourced our internal telemetry scraper because commercial solutions are either $2k/mo or completely unmaintainable.",
          painScore: 91,
          timeAgo: "Just now",
          sentiment: "WILLING_TO_PAY",
          vectors: ["OPEN_SOURCE_DISRUPTION", "PRICING_GOUGE"],
        },
        ...prev,
      ]);
    }, 1000);
  };

  const handleLockVector = (vec: string) => {
    setLockedVector(vec);
    onSelectSignalVector?.(vec);
    setTimeout(() => setLockedVector(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#020408]/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-[#0b0f12] border-l border-[rgba(139,92,246,0.3)] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(139,92,246,0.25)] bg-[#101417] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Radio className="size-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Problem Radar // Live Ingest
              </h3>
              <p className="text-xs font-mono text-[#cbc3d7]/70">
                Continuous surveillance of 45+ developer communities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-[#181c1f] text-[#A78BFA] hover:bg-white/10 transition border border-white/5 disabled:opacity-50 cursor-pointer"
              title="Refresh radar signals"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#958ea0] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-2.5 border-b border-white/5 bg-[#101417]/50 flex items-center gap-2 text-xs font-mono">
          <span className="text-[#958ea0]">Filter:</span>
          {["ALL", "WILLING_TO_PAY", "HIGH_FRICTION", "WORKAROUND_SEEKING"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                filter === f
                  ? "bg-[#A78BFA] text-black font-bold"
                  : "bg-[#181c1f] text-[#cbc3d7] hover:text-white"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Signal List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {signals
            .filter((s) => filter === "ALL" || s.sentiment === filter)
            .map((item) => {
              return (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-5 border border-[rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.6)] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white bg-[#181c1f] px-2 py-0.5 rounded border border-white/5">
                        {item.source}
                      </span>
                      <span className="text-xs font-mono text-[#958ea0]">{item.community}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] font-bold">
                        PAIN: {item.painScore}/100
                      </span>
                      <span className="text-[10px] font-mono text-[#958ea0]">{item.timeAgo}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#e0e3e7] leading-relaxed italic bg-[#020408]/60 p-3 rounded-lg border border-white/5">
                    "{item.snippet}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {item.vectors.map((vec) => (
                        <button
                          key={vec}
                          onClick={() => handleLockVector(vec)}
                          className="px-2 py-0.5 rounded bg-[#181c1f] text-[#A78BFA] hover:bg-[#A78BFA] hover:text-black font-mono text-[10px] border border-[rgba(139,92,246,0.3)] transition cursor-pointer"
                        >
                          +{vec}
                        </button>
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-[#A78BFA] uppercase">
                      {item.sentiment.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[rgba(139,92,246,0.25)] bg-[#101417] flex items-center justify-between text-xs font-mono text-[#958ea0]">
          {lockedVector ? (
            <span className="text-[#A78BFA] flex items-center gap-1.5">
              <CheckCircle2 className="size-4" /> Locked vector: <strong>{lockedVector}</strong>
            </span>
          ) : (
            <span>Click any +vector tag to lock into active telemetry</span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181c1f] text-white hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
