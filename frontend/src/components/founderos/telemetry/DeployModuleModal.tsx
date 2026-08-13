import React, { useState } from "react";
import { X, Plus, CheckCircle2, Cpu, ShieldCheck, Zap, Sparkles, Layers } from "lucide-react";

export interface TelemetryModuleDef {
  id: string;
  name: string;
  category: string;
  icon: string;
  status: "Active" | "Scanning" | "Standby" | "Deployed";
  description: string;
  tags: string[];
  isCustom?: boolean;
}

export const AVAILABLE_MARKETPLACE_MODULES: TelemetryModuleDef[] = [
  {
    id: "competitor-war-room",
    name: "Competitor War Room",
    category: "Intelligence",
    icon: "swords",
    status: "Standby",
    description: "Continuous reverse-engineering of competitor pricing, feature velocity, and changelogs.",
    tags: ["DIFF_ENGINE", "WEB_SCRAPE_v4"],
  },
  {
    id: "tokenomics-sim",
    name: "Unit Economics Simulator",
    category: "Financials",
    icon: "account_balance",
    status: "Standby",
    description: "Monte Carlo simulation of customer acquisition costs, churn elasticity, and multi-tier SaaS margins.",
    tags: ["MONTE_CARLO", "CAC_LTV"],
  },
  {
    id: "investor-pitch-ai",
    name: "Autonomous Investor Brief AI",
    category: "Fundraising",
    icon: "campaign",
    status: "Standby",
    description: "Real-time auto-generation of memo slides and traction teardowns for tier-1 VC partners.",
    tags: ["DECK_SYNTH", "VALUATION_v2"],
  },
  {
    id: "growth-hook",
    name: "Growth Funnel Telemetry",
    category: "Growth",
    icon: "insights",
    status: "Standby",
    description: "Live conversion attribution across cold outreach, HackerNews launches, and viral waitlists.",
    tags: ["ATTRIBUTION", "FUNNEL_PULSE"],
  },
  {
    id: "compliance-shield",
    name: "Regulatory & IP Shield",
    category: "Security",
    icon: "shield_lock",
    status: "Standby",
    description: "Automated scan for patent collisions, trademark clearances, and GDPR / SOC2 preparedness.",
    tags: ["LEGAL_AI", "IP_GUARD"],
  },
];

interface DeployModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  installedModuleIds: string[];
  onDeployModule: (module: TelemetryModuleDef) => void;
}

export const DeployModuleModal: React.FC<DeployModuleModalProps> = ({
  isOpen,
  onClose,
  installedModuleIds,
  onDeployModule,
}) => {
  const [filter, setFilter] = useState<string>("All");

  if (!isOpen) return null;

  const categories = ["All", "Intelligence", "Financials", "Fundraising", "Growth", "Security"];

  const filtered = AVAILABLE_MARKETPLACE_MODULES.filter(
    (m) => filter === "All" || m.category === filter
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020408]/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-3xl rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0b0f12] text-[#e0e3e7] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.25)] bg-[#101417]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                FounderOS Module Marketplace
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                  ENTERPRISE NODES
                </span>
              </h3>
              <p className="text-xs font-mono text-[#cbc3d7]/70">
                Deploy autonomous micro-services directly to your telemetry mission board.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#958ea0] hover:text-white hover:bg-white/5 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#101417]/60 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filter === cat
                  ? "bg-[#A78BFA] text-black font-bold shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                  : "bg-[#181c1f] text-[#cbc3d7] hover:bg-white/5 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((mod) => {
              const isInstalled = installedModuleIds.includes(mod.id);

              return (
                <div
                  key={mod.id}
                  className={`glass-card rounded-xl p-5 border transition-all flex flex-col justify-between ${
                    isInstalled
                      ? "border-[rgba(65,223,160,0.4)] bg-[rgba(65,223,160,0.03)]"
                      : "border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.6)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-lg bg-[#262a2e] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA]">
                          <span className="material-symbols-outlined text-lg">
                            {mod.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{mod.name}</h4>
                          <span className="text-[10px] font-mono text-[#958ea0]">
                            {mod.category}
                          </span>
                        </div>
                      </div>
                      {isInstalled ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Deployed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2023] text-[#958ea0] border border-[#313538]">
                          Available
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#cbc3d7] leading-relaxed mb-4">
                      {mod.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {mod.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#181c1f] text-[#958ea0] font-mono text-[10px] border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (!isInstalled) onDeployModule(mod);
                      }}
                      disabled={isInstalled}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 ${
                        isInstalled
                          ? "bg-[#181c1f] text-[#A78BFA] border border-[rgba(139,92,246,0.3)] cursor-default"
                          : "bg-[#A78BFA] text-black hover:bg-[#bfa8ff] shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          <span>Node Active</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          <span>Deploy Node</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[rgba(139,92,246,0.25)] bg-[#101417] flex justify-between items-center text-xs font-mono text-[#958ea0]">
          <span>FounderOS v2.4 Marketplace Protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#181c1f] text-white hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
