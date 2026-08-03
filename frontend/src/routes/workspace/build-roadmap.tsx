import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Button,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  Progress,
  Stat,
  TextArea,
  TextInput,
} from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Layers, ShieldAlert, Cpu, CheckCircle2, History, Clock, ArrowRight, Code, Flag } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Build Roadmap — FounderOS";
const DESCRIPTION = "AI-generated CTO product development roadmap, timelines, deliverables, and technology stack.";

export const Route = createFileRoute("/workspace/build-roadmap")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RoadmapPage,
});

export interface RoadmapData {
  overview: string;
  developmentPhases: {
    phaseName: string;
    duration: string;
    objectives: string;
    tasks: string[];
    deliverables: string[];
    technologies: string[];
  }[];
  teamRequirements: string[];
  risks: string[];
  milestones: string[];
  launchChecklist: string[];
  futureImprovements: string[];
}

export function RoadmapPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [startupIdeaInput, setStartupIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [targetUsersInput, setTargetUsersInput] = useState("");
  const [stackInput, setStackInput] = useState("React, Node.js, Express, MongoDB Atlas, Gemini AI API");

  // Scope Data
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "Untitled Venture");
      setStartupIdeaInput(venture.brief?.building || "AI Execution Operating System for Founders");
      setMvpScopeInput(venture.mvp?.job || "2-week core MVP scope");
      setTargetUsersInput(venture.brief?.audience || "Early-stage founders, SaaS builders");
      loadRoadmapHistory();
    }
  }, [venture?.id]);

  async function loadRoadmapHistory() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getBuildRoadmapHistory(venture.id);
      if (res.success && res.data?.buildRoadmap) {
        setRoadmapData(res.data.buildRoadmap.roadmap || null);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load build roadmap history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateRoadmap(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!venture?.id || generating) return;

    setGenerating(true);
    try {
      const res = await api.generateBuildRoadmapModule({
        ventureId: venture.id,
        ventureName: ventureNameInput,
        startupIdea: startupIdeaInput,
        mvpScope: mvpScopeInput,
        users: targetUsersInput,
        stack: stackInput,
      });

      if (res.success && res.data?.buildRoadmap) {
        setRoadmapData(res.data.buildRoadmap.roadmap);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.buildRoadmap, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to generate build roadmap:", err);
    } finally {
      setGenerating(false);
    }
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  return (
    <>
      <PageHeader
        eyebrow="Step 05"
        title="Build Roadmap AI Generator"
        description="AI CTO designs a 4-phase software development timeline, team requirements, and launch checklist."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#46E3A3]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Saved Roadmaps</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateRoadmap()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#46E3A3]/40 bg-gradient-to-r from-[#46E3A3] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(70,227,163,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Generating..." : "Generate Build Roadmap"}
            </button>
          </div>
        }
      />

      {/* Generated from Founder Conversation Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#46E3A3]" />
        <div>
          <span className="font-bold text-[#46E3A3]">AI CTO Active: </span>
          Input your software stack & MVP scope parameters below to generate a CTO build roadmap persisted to MongoDB.
        </div>
      </div>

      {/* Inputs Form */}
      <Panel title="CTO Roadmap Inputs">
        <form onSubmit={handleGenerateRoadmap} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="Venture name"
              />
            </Field>
            <Field label="Target Users">
              <TextInput
                value={targetUsersInput}
                onChange={(e) => setTargetUsersInput(e.target.value)}
                placeholder="Target user segment"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startup Idea">
              <TextArea
                rows={2}
                value={startupIdeaInput}
                onChange={(e) => setStartupIdeaInput(e.target.value)}
                placeholder="Startup idea overview"
              />
            </Field>
            <Field label="MVP Scope & Features">
              <TextArea
                rows={2}
                value={mvpScopeInput}
                onChange={(e) => setMvpScopeInput(e.target.value)}
                placeholder="MVP core features & scope"
              />
            </Field>
          </div>

          <Field label="Preferred Technology Stack">
            <TextInput
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              placeholder="e.g. React, Node.js, Express, MongoDB Atlas, Gemini AI"
            />
          </Field>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#46E3A3] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(70,227,163,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Planning Roadmap..." : "Generate CTO Roadmap"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading Animation */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#46E3A3]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#46E3A3]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Constructing CTO Development Roadmap...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Structuring 4 development phases, technical deliverables, risks, and launch checklist</p>
          </div>
        </div>
      )}

      {/* 7 Components Roadmap Display */}
      {roadmapData && !generating && (
        <div className="space-y-6">
          {/* Component 1: Roadmap Overview Card */}
          <div className="rounded-2xl border border-[#46E3A3]/30 bg-[#0E131C] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#46E3A3] bg-[#46E3A3]/10 px-2.5 py-1 rounded-lg border border-[#46E3A3]/20">
                1. Product Development Overview
              </span>
              <span className="text-xs font-mono text-[#64D8FF]">Phases: 4 | Status: Ready for Sprint</span>
            </div>
            <p className="text-sm font-medium text-[#F5F8FC] leading-relaxed">{roadmapData.overview}</p>
          </div>

          {/* Component 2 & 3: Timeline View & Development Phase Cards */}
          <div className="relative space-y-6 border-l border-white/10 pl-6">
            {roadmapData.developmentPhases?.map((p, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[31px] top-6 size-2.5 rounded-full bg-[#46E3A3] shadow-[0_0_12px_rgba(70,227,163,0.8)]" />
                <Panel
                  title={`${p.phaseName}`}
                  action={
                    <span className="text-xs font-mono text-[#46E3A3] bg-[#46E3A3]/10 px-2.5 py-1 rounded-lg border border-[#46E3A3]/20">
                      Duration: {p.duration}
                    </span>
                  }
                >
                  <p className="text-xs text-[#A8B3C7] mb-3"><strong className="text-[#F5F8FC]">Objective: </strong>{p.objectives}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Tasks */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#64D8FF]">Development Tasks</span>
                      <ul className="space-y-1.5">
                        {p.tasks?.map((t, ti) => (
                          <li key={ti} className="flex items-center gap-2 text-xs text-[#F5F8FC] bg-[#141C28] p-2.5 rounded-xl border border-white/5">
                            <CheckCircle2 className="size-3.5 text-[#46E3A3] shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#46E3A3]">Key Deliverables</span>
                      <ul className="space-y-1.5">
                        {p.deliverables?.map((d, di) => (
                          <li key={di} className="flex items-center gap-2 text-xs text-[#E1F4FF] bg-[#141C28] p-2.5 rounded-xl border border-white/5">
                            <Flag className="size-3.5 text-[#64D8FF] shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Phase Technologies */}
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs font-mono text-[#A8B3C7]">
                      <span className="text-[10px] uppercase font-bold text-[#A8B3C7]">Phase Tech:</span>
                      {p.technologies.map((tech, tei) => (
                        <span key={tei} className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-[#F5F8FC]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            ))}
          </div>

          {/* Component 4 & 5: Task Checklist & Technology Stack Display */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 5: Technology Stack Display */}
            <Panel title="5. Technology Stack Architecture">
              <div className="flex flex-wrap gap-2">
                {stackInput.split(",").map((tech, i) => (
                  <span key={i} className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 px-3 py-2 text-xs font-mono text-[#64D8FF]">
                    <Code className="size-3.5 text-[#64D8FF]" />
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </Panel>

            {/* Component 4: Important Milestones */}
            <Panel title="4. Critical Milestones">
              <ul className="space-y-2">
                {roadmapData.milestones?.map((m, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <Flag className="size-4 text-[#46E3A3] shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Component 6 & 7: Risk Analysis Card & Launch Checklist */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 6: Risk Analysis Card */}
            <Panel title="6. Risk Analysis & Mitigations">
              <ul className="space-y-2">
                {roadmapData.risks?.map((r, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <ShieldAlert className="size-4 text-red-400 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Component 7: Launch Checklist */}
            <Panel title="7. Pre-Launch Readiness Checklist">
              <ul className="space-y-2">
                {roadmapData.launchChecklist?.map((c, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Build Roadmap</Button>
        <LinkButton to="/workspace/marketing-plan" variant="primary">
          Continue to Marketing Plan
        </LinkButton>
      </div>
    </>
  );
}