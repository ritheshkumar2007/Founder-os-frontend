import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Button,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  TextArea,
  TextInput,
} from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Layers, ShieldAlert, Cpu, CheckCircle2, History, Clock, ArrowRight, Code, Flag, AlertCircle } from "lucide-react";
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

function formatBuildRoadmap(raw: any, fallbackName: string, startupIdeaInput: string, mvpScopeInput: string): RoadmapData {
  const data = raw?.roadmap || raw?.buildRoadmap || raw || {};
  const idea = startupIdeaInput || "Startup Concept";
  const mvp = mvpScopeInput || "2-week core MVP features";

  const overview = data.overview || `Engineering execution plan for ${fallbackName || "FounderOS"}: A structured 4-phase technical roadmap targeting a high-performance 2-week MVP launch for ${idea}.`;

  const developmentPhases = (Array.isArray(data.developmentPhases) && data.developmentPhases.length > 0)
    ? data.developmentPhases
    : [
        {
          phaseName: "Phase 1: Architecture & Data Schema Setup",
          duration: "Days 1–3",
          objectives: "Initialize core project architecture, database schemas, and API authentication handlers.",
          tasks: [
            "Setup Express REST API routes & CORS preflight middleware",
            "Configure MongoDB Atlas schemas & Mongoose data indexing",
            "Implement JWT Authentication & User Session Middleware",
          ],
          deliverables: ["Production API Gateway", "Database Connection Pool", "Auth Token Verification"],
          technologies: ["Node.js", "Express", "MongoDB Atlas", "JWT"],
        },
        {
          phaseName: "Phase 2: Core Feature Engine & Integrations",
          duration: "Days 4–9",
          objectives: `Develop primary workflows matching ${mvp}, AI prompt engine, and state managers.`,
          tasks: [
            "Wire Layer 1 Prompt Engine with Gemini 1.5 Flash API",
            "Implement Layer 2 Venture Memory state persistence",
            "Build interactive React dashboard components & store hooks",
          ],
          deliverables: ["AI Scope Engine", "State Sync Hook", "Interactive Workspace UI"],
          technologies: ["React", "TypeScript", "Zustand", "Gemini AI API"],
        },
        {
          phaseName: "Phase 3: QA, Security & Production Deployment",
          duration: "Days 10–14",
          objectives: "Perform end-to-end integration testing, preflight security audits, and cloud deployment.",
          tasks: [
            "Audit CORS headers & NoSQL injection sanitizers",
            "Deploy Express backend on Render with auto-restart",
            "Deploy React frontend bundle on Vercel / Cloudflare Pages",
          ],
          deliverables: ["Live Production Backend URL", "Live SSL Web Application", "System Health Check Endpoint"],
          technologies: ["Render", "Cloudflare Pages", "Vite", "Git CI/CD"],
        },
        {
          phaseName: "Phase 4: Post-Launch Optimization & Scaling",
          duration: "Weeks 3–4",
          objectives: "Monitor user telemetry, optimize vector RAG retrieval, and expand feature modules.",
          tasks: [
            "Track active session analytics & response latency",
            "Optimize MongoDB Vector Search indexes for RAG context",
            "Implement automated feedback collection webhooks",
          ],
          deliverables: ["Telemetry Dashboard", "Vector Search Index", "Feedback Pipeline"],
          technologies: ["MongoDB Vector Search", "OpenTelemetry", "Webhooks"],
        },
      ];

  const teamRequirements = (Array.isArray(data.teamRequirements) && data.teamRequirements.length > 0)
    ? data.teamRequirements
    : [
        "Full-Stack Lead Engineer (React, Node.js, Express)",
        "AI / Backend Specialist (Gemini API, Prompt Architecture, Vector RAG)",
        "UI/UX Product Designer (TailwindCSS, Component Systems)",
      ];

  const risks = (Array.isArray(data.risks) && data.risks.length > 0)
    ? data.risks
    : [
        "Risk: AI Rate Limiting & Latency Spikes ➔ Mitigation: Add smart dynamic fallback generators and local cache.",
        "Risk: Scope Creep During 2-Week Sprint ➔ Mitigation: Enforce strict Must-Have vs Excluded feature guardrails.",
        "Risk: CORS & Deployment Port Mismatches ➔ Mitigation: Enforce universal origin-echoing CORS preflight headers.",
      ];

  const milestones = (Array.isArray(data.milestones) && data.milestones.length > 0)
    ? data.milestones
    : [
        "Milestone 1 (Day 3): Backend API & Database Connectivity Live",
        "Milestone 2 (Day 9): AI Scope & Prompt Engine Integration Complete",
        "Milestone 3 (Day 14): Production Deployment & Launch Readiness Verified",
      ];

  const launchChecklist = (Array.isArray(data.launchChecklist) && data.launchChecklist.length > 0)
    ? data.launchChecklist
    : [
        "Verify SSL / HTTPS Certificates on API Endpoints",
        "Perform CORS Preflight Header Validation across all Ports",
        "Test Database Indexes for Sub-200ms Query Latency",
        "Verify JWT Expiration & Cookie Security Flags",
      ];

  const futureImprovements = (Array.isArray(data.futureImprovements) && data.futureImprovements.length > 0)
    ? data.futureImprovements
    : [
        "Automated GitHub Repository Scaffolding CLI",
        "Enterprise SSO & SAML Authentication",
        "Native Mobile iOS / Android Companion Apps",
      ];

  return {
    overview,
    developmentPhases,
    teamRequirements,
    risks,
    milestones,
    launchChecklist,
    futureImprovements,
  };
}

function RoadmapPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs (clean inputs - auto-inherits from Venture Memory if present)
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [startupIdeaInput, setStartupIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [targetUsersInput, setTargetUsersInput] = useState("");
  const [stackInput, setStackInput] = useState("");

  // Scope Data
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const ventureId = venture?.id || (venture as any)?._id || "6a709d6ff4af39139e040cc8";
  const hasVentureMemory = Boolean(venture?.brief?.building || venture?.mvpScope?.mustHaveFeatures?.length || venture?.name);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setStartupIdeaInput(venture.brief?.building || "");
      setMvpScopeInput(venture.mvpScope?.mustHaveFeatures?.join(", ") || venture.mvp?.job || "");
      setTargetUsersInput(venture.brief?.audience || "");
      setStackInput("React, Node.js, Express, MongoDB Atlas, Gemini AI API");
      loadRoadmapHistory();
    } else {
      loadRoadmapHistory();
    }
  }, [ventureId]);

  async function loadRoadmapHistory() {
    setLoading(true);
    try {
      const res = await api.getBuildRoadmapHistory(ventureId);
      if (res.success && res.data?.buildRoadmap) {
        const formatted = formatBuildRoadmap(res.data.buildRoadmap, ventureNameInput, startupIdeaInput, mvpScopeInput);
        setRoadmapData(formatted);
        setHistory(res.data.history || []);
      } else {
        setRoadmapData(null);
      }
    } catch (err) {
      console.warn("Failed to load build roadmap history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateRoadmap(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;

    setGenerating(true);
    try {
      const res = await api.generateBuildRoadmapModule({
        ventureId,
        ventureName: ventureNameInput || "Untitled Venture",
        startupIdea: startupIdeaInput || "Startup Concept",
        mvpScope: mvpScopeInput || "2-week core MVP features",
        users: targetUsersInput || "Target Customers",
        stack: stackInput || "React, Node.js, Express, MongoDB Atlas, Gemini AI API",
      });

      if (res.success && res.data?.buildRoadmap) {
        const formatted = formatBuildRoadmap(res.data.buildRoadmap, ventureNameInput, startupIdeaInput, mvpScopeInput);
        setRoadmapData(formatted);
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

  return (
    <>
      <PageHeader
        eyebrow="Step 05"
        title="Technical Build Roadmap AI Generator"
        description="AI CTO Product Manager designs a 4-phase engineering development roadmap, timelines, and technical deliverables."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Versions Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateRoadmap()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(100,216,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "AI CTO Is Designing Roadmap..." : "Generate Technical Roadmap"}
            </button>
          </div>
        }
      />

      {/* Banner */}
      {hasVentureMemory ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
          <Sparkles className="size-5 shrink-0 text-[#64D8FF]" />
          <div>
            <span className="font-bold text-[#64D8FF]">Venture Memory Connected: </span>
            Auto-inherited your MVP feature scope from Step 4. Adjust your tech stack preferences below to generate your 4-phase engineering roadmap.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold text-amber-300">No Upstream MVP Memory: </span>
            Input your startup idea and scope in the form below or complete Step 4 (MVP Scope) to auto-populate parameters.
          </div>
        </div>
      )}

      {/* Form Inputs */}
      <Panel title="Technical Roadmap Inputs">
        <form onSubmit={handleGenerateRoadmap} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="e.g. Acme SaaS or leave blank"
              />
            </Field>
            <Field label="Preferred Tech Stack">
              <TextInput
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                placeholder="e.g. React, Node.js, Express, MongoDB Atlas"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Startup Product Idea">
              <TextArea
                rows={2}
                value={startupIdeaInput}
                onChange={(e) => setStartupIdeaInput(e.target.value)}
                placeholder="Describe your core product concept"
              />
            </Field>
            <Field label="MVP Scope & Key Features">
              <TextArea
                rows={2}
                value={mvpScopeInput}
                onChange={(e) => setMvpScopeInput(e.target.value)}
                placeholder="Inherited 2-week core MVP features"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(79,140,255,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI CTO Is Designing Roadmap..." : "Generate Technical Roadmap"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#64D8FF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">AI CTO Is Designing Technical Roadmap...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Structuring 4-phase development timeline, deliverables, architecture stack, and risks</p>
          </div>
        </div>
      )}

      {/* Roadmap Output Display */}
      {roadmapData && !generating && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="rounded-2xl border border-[#64D8FF]/40 bg-[#0E131C] p-6 shadow-2xl space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
              CTO Strategy Overview
            </span>
            <p className="text-sm text-[#F5F8FC] leading-relaxed pt-1">{roadmapData.overview}</p>
          </div>

          {/* 4-Phase Development Timeline */}
          <Panel title="4-Phase Product Development Timeline">
            <div className="space-y-4">
              {roadmapData.developmentPhases?.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg">
                        Phase {i + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#F5F8FC]">{p.phaseName}</h4>
                    </div>
                    <span className="font-mono text-xs text-[#46E3A3] bg-[#46E3A3]/10 px-3 py-1 rounded-full border border-[#46E3A3]/30">
                      {p.duration}
                    </span>
                  </div>

                  <p className="text-xs text-[#A8B3C7] font-sans">{p.objectives}</p>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div>
                      <span className="text-[11px] font-mono font-semibold text-[#64D8FF]">Key Engineering Tasks:</span>
                      <ul className="mt-1 space-y-1 text-xs text-[#F5F8FC]">
                        {p.tasks?.map((t, ti) => (
                          <li key={ti} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono font-semibold text-[#46E3A3]">Deliverables:</span>
                      <ul className="mt-1 space-y-1 text-xs text-[#A8B3C7]">
                        {p.deliverables?.map((d, di) => (
                          <li key={di} className="flex items-center gap-2">
                            <Code className="size-3.5 text-[#64D8FF] shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {p.technologies?.map((tech, tei) => (
                      <span key={tei} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-mono text-[#64D8FF] border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Team Requirements & Engineering Risks */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Team Roles Required">
              <ul className="space-y-2">
                {roadmapData.teamRequirements?.map((role, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <Cpu className="size-4 text-[#64D8FF]" />
                    <span>{role}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Technical Risks & Mitigations">
              <ul className="space-y-2">
                {roadmapData.risks?.map((risk, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <ShieldAlert className="size-4 text-red-400 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Key Engineering Milestones & Pre-Launch Checklist */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Key Engineering Milestones">
              <ul className="space-y-2">
                {roadmapData.milestones?.map((m, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs font-semibold text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <Flag className="size-4 text-[#64D8FF]" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Pre-Launch Security & QA Checklist">
              <ul className="space-y-2">
                {roadmapData.launchChecklist?.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {/* Empty State Banner when no roadmap has been generated yet */}
      {!roadmapData && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0E131C] p-12 text-center space-y-3">
          <Cpu className="size-10 text-[#64D8FF]/60" />
          <h3 className="text-base font-bold text-[#F5F8FC]">No Technical Roadmap Generated Yet</h3>
          <p className="max-w-md text-xs text-[#A8B3C7] font-sans">
            Review your startup parameters and tech stack preferences above, then click <strong>Generate Technical Roadmap</strong> to construct your 4-phase development timeline and deliverables.
          </p>
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