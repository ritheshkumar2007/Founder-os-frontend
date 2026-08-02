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
    subtitle: "Idea Positioning & Thesis",
    description: "Transform an abstract idea into a validated venture brief. AI analyzes market gaps, identifies unfair advantages, and defines target customer personas instantly.",
    icon: Sparkles,
    badge: "STAGE 01",
    details: [
      "AI positioning matrix & competitive space analysis",
      "Core thesis generator with value proposition scoring",
      "One-click founder brief export"
    ],
    telemetryMetric: "98.4%",
    telemetryLabel: "Idea Clarity Score"
  },
  {
    id: "stage-2",
    stepNumber: "02",
    title: "Problem Radar",
    subtitle: "Customer Pain Synthesis",
    description: "Don't build in the dark. FounderOS transcribes customer interviews, scores problem severity, and detects high-willingness-to-pay signals before you write code.",
    icon: Radar,
    badge: "STAGE 02",
    details: [
      "Automated transcript parsing & pain intensity extraction",
      "Willingness-to-pay heatmap across customer cohorts",
      "Go / No-Go decision confidence index"
    ],
    telemetryMetric: "82.6%",
    telemetryLabel: "Validation Signal"
  },
  {
    id: "stage-3",
    stepNumber: "03",
    title: "Precision MVP Scope",
    subtitle: "Zero-Bloat Architecture",
    description: "Cut out months of feature bloat. Scope the absolute smallest working software version that solves the core problem and delivers immediate customer delight.",
    icon: Layers,
    badge: "STAGE 03",
    details: [
      "Strict feature prioritization matrix (Build Now vs Later)",
      "Recommended modern tech stack architecture",
      "API schema & data model auto-generation"
    ],
    telemetryMetric: "-65%",
    telemetryLabel: "Build Time Reduction"
  },
  {
    id: "stage-4",
    stepNumber: "04",
    title: "7-Day Build Sprint",
    subtitle: "Hyper-Focused Execution",
    description: "Time-boxed, high-velocity execution engine. Daily sprint logs, milestone tracking, and task prioritization keep your team shippable in 7 days.",
    icon: Zap,
    badge: "STAGE 04",
    details: [
      "7-day sprint checklist for product & growth",
      "Automated milestone completion tracking",
      "Pre-launch countdown & waitlist mechanics"
    ],
    telemetryMetric: "6.8 Days",
    telemetryLabel: "Average Sprint Speed"
  },
  {
    id: "stage-5",
    stepNumber: "05",
    title: "Traction & Investor Growth",
    subtitle: "Live Data Room & Analytics",
    description: "Scale with real traction metrics. Track active users, revenue growth, unit economics, and share live investor data rooms with VC partners.",
    icon: Rocket,
    badge: "STAGE 05",
    details: [
      "Real-time MRR & retention velocity metrics",
      "Automated investor update generator",
      "Cap table & runway projection engine"
    ],
    telemetryMetric: "$420M+",
    telemetryLabel: "Capital Raised by Founders"
  }
];

export const TrajectoryStoryline: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>("stage-1");
  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[0];

  return (
    <section id="trajectory" className="relative py-24 px-4 max-w-7xl mx-auto z-10 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#0E131C] text-xs font-mono text-[#64D8FF]">
          <Sparkles className="size-3.5 text-[#4F8CFF]" />
          <span>STARTUP WORKFLOW FRAMEWORK</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-display text-[#F5F8FC] tracking-tight">
          From Idea Brief to <span className="text-gradient-system">Scaled Venture</span>
        </h2>
        <p className="text-base text-[#A8B3C7]">
          Follow the 5-stage operating system trajectory to build with speed, clarity, and precision.
        </p>
      </div>

      {/* Interactive Trajectory Navigation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STAGES.map((s) => {
          const isActive = s.id === activeStageId;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStageId(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                isActive
                  ? "border-[#4F8CFF] bg-[#161F2D] shadow-[0_0_20px_rgba(79,140,255,0.2)]"
                  : "border-white/5 bg-[#121924] hover:bg-[#1A2433] hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${isActive ? "text-[#4F8CFF]" : "text-[#A8B3C7]"}`}>
                  {s.stepNumber}
                </span>
                <Icon className={`size-4 ${isActive ? "text-[#64D8FF]" : "text-[#74839B]"}`} />
              </div>
              <p className={`text-xs font-semibold truncate ${isActive ? "text-[#F5F8FC]" : "text-[#A8B3C7]"}`}>
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Workspace Panel */}
      <div className="panel p-8 sm:p-10 border border-white/10 bg-[#161F2D] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/15 text-[#64D8FF] font-semibold">
                {activeStage.badge}
              </span>
              <span className="text-xs font-mono text-[#A8B3C7]">STEP {activeStage.stepNumber} OF 05</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-[#F5F8FC]">
                {activeStage.title}
              </h3>
              <p className="text-sm font-mono text-[#64D8FF] mt-1">{activeStage.subtitle}</p>
            </div>

            <p className="text-sm text-[#A8B3C7] leading-relaxed">{activeStage.description}</p>

            <div className="space-y-2 pt-2">
              {activeStage.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#F5F8FC]">
                  <Check className="size-4 text-[#46E3A3] shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center p-6 rounded-2xl border border-white/5 bg-[#0E131C] space-y-4">
            <span className="text-xs font-mono uppercase text-[#74839B]">Stage Metric Benchmark</span>
            <p className="text-4xl sm:text-5xl font-bold font-display text-[#4F8CFF]">
              {activeStage.telemetryMetric}
            </p>
            <p className="text-xs font-mono text-[#A8B3C7]">{activeStage.telemetryLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
