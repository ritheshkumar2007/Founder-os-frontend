import React, { useState } from "react";
import { Sparkles, Radar, Layers, Zap, Rocket, ChevronRight, Check, ArrowRight } from "lucide-react";

interface Stage {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  details: string[];
  telemetryMetric: string;
  telemetryLabel: string;
}

const STAGES: Stage[] = [
  {
    id: "stage-1",
    stepNumber: "01",
    title: "Idea Validation Brief",
    subtitle: "Positioning & Market Thesis",
    description: "Analyze market gaps, define target buyer personas, and score value proposition viability before writing any code.",
    icon: Sparkles,
    badge: "STAGE 01",
    details: [
      "Target customer ICP definition",
      "Competitive gap analysis",
      "One-click founder brief export"
    ],
    telemetryMetric: "100-Pt",
    telemetryLabel: "Viability Scorecard"
  },
  {
    id: "stage-2",
    stepNumber: "02",
    title: "Problem Radar",
    subtitle: "Customer Pain & Demand",
    description: "Synthesize customer interview notes, score problem severity, and verify real willingness-to-pay before building.",
    icon: Radar,
    badge: "STAGE 02",
    details: [
      "Customer interview transcript parsing",
      "Willingness-to-pay validation signals",
      "Go / No-Go decision confidence scoring"
    ],
    telemetryMetric: "5-10",
    telemetryLabel: "Verified User Interviews"
  },
  {
    id: "stage-3",
    stepNumber: "03",
    title: "Precision MVP Scope",
    subtitle: "Zero-Bloat Architecture",
    description: "Eliminate feature bloat. Scope the smallest functional version that solves the core problem and delivers immediate customer utility.",
    icon: Layers,
    badge: "STAGE 03",
    details: [
      "Strict build-now vs build-later feature cuts",
      "Modern tech stack recommendations",
      "Database schema & API spec generation"
    ],
    telemetryMetric: "3",
    telemetryLabel: "Core MVP Features Max"
  },
  {
    id: "stage-4",
    stepNumber: "04",
    title: "7-Day Build Sprint",
    subtitle: "Time-Boxed Execution",
    description: "Daily shippable micro-sprints and scope-creep warnings to take your MVP from clean repo to live production in one week.",
    icon: Zap,
    badge: "STAGE 04",
    details: [
      "Day 1-7 actionable engineering checklist",
      "Scope-creep alert triggers",
      "Deployment & waitlist onboarding"
    ],
    telemetryMetric: "7 Days",
    telemetryLabel: "Sprint to Live Production"
  },
  {
    id: "stage-5",
    stepNumber: "05",
    title: "Traction & Investor Growth",
    subtitle: "Diligence Data Room",
    description: "Track active usage, MRR velocity, and share verified investor data rooms with cap table projections.",
    icon: Rocket,
    badge: "STAGE 05",
    details: [
      "Live MRR & retention tracking",
      "Automated investor monthly updates",
      "Cap table & runway projection models"
    ],
    telemetryMetric: "1-Click",
    telemetryLabel: "Live Diligence Room Export"
  }
];

export const TrajectoryStoryline: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  return (
    <section id="trajectory" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 space-y-8 sm:space-y-12 overflow-hidden">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-xs font-mono text-[#A78BFA]">
          <Sparkles className="size-3.5 text-[#A78BFA]" />
          <span>THE 5-STAGE SYSTEM</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight">
          From Raw Idea to <span className="text-gradient-system">Fundable Venture</span>
        </h2>
        <p className="text-sm sm:text-base text-[#cbc3d7] max-w-2xl mx-auto leading-relaxed">
          A proven sequential workflow designed to eliminate waste and keep you shipping.
        </p>
      </div>

      {/* Interactive Trajectory Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        {STAGES.map((s) => {
          const isActive = s.id === activeStageId;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStageId(s.id)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-[#A78BFA] bg-[#101417] shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                  : "border-white/5 bg-[#0b0f12] hover:bg-[#101417] hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className={`text-xs font-mono font-bold ${isActive ? "text-[#A78BFA]" : "text-[#cbc3d7]"}`}>
                  {s.stepNumber}
                </span>
                <Icon className={`size-3.5 sm:size-4 ${isActive ? "text-[#A78BFA]" : "text-[#958ea0]"}`} />
              </div>
              <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-[#cbc3d7]"}`}>
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Workspace Panel */}
      <div className="panel p-5 sm:p-8 lg:p-10 border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.15)] overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.15)] text-[#A78BFA] font-semibold">
                {activeStage.badge}
              </span>
              <span className="text-xs font-mono text-[#958ea0]">STEP {activeStage.stepNumber} OF 05</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white">
                {activeStage.title}
              </h3>
              <p className="text-xs sm:text-sm font-mono text-[#A78BFA] mt-1">{activeStage.subtitle}</p>
            </div>

            <p className="text-xs sm:text-sm text-[#cbc3d7] leading-relaxed">{activeStage.description}</p>

            <div className="space-y-2 pt-2">
              {activeStage.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-white">
                  <Check className="size-4 text-[#A78BFA] shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center p-4 sm:p-6 rounded-2xl border border-white/5 bg-[#101417] space-y-2 text-center sm:text-left">
            <span className="text-xs font-mono uppercase text-[#958ea0]">Stage Milestone</span>
            <p className="text-3xl sm:text-4xl font-bold font-display text-[#A78BFA]">
              {activeStage.telemetryMetric}
            </p>
            <p className="text-xs font-mono text-[#cbc3d7]">{activeStage.telemetryLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
