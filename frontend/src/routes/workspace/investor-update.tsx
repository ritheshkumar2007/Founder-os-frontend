import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Button,
  CopyButton,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  TextArea,
  TextInput,
} from "@/components/founderos/ui";
import { Sparkles, RefreshCw, Printer, Copy, CheckCircle2, History, TrendingUp, Flag, ShieldAlert, DollarSign, FileText } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Investor Update — FounderOS";
const DESCRIPTION = "AI Investor Relations generator creates executive update memorandums, milestone breakdowns, and traction highlights.";

export const Route = createFileRoute("/workspace/investor-update")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvestorPage,
});

export interface InvestorUpdateData {
  companyOverview: string;
  period: { month: string; quarter: string };
  startupProgress: {
    milestones: string[];
    productUpdates: string[];
    tractionHighlights: string[];
    revenueUpdates: string[];
  };
  investorMessage: {
    summary: string;
    keyAchievements: string[];
    growthMetrics: string[];
    challenges: string[];
    solutions: string[];
    nextQuarterGoals: string[];
    fundingNeeds: string;
  };
  generatedUpdateText: string;
}

export function InvestorPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [overviewInput, setOverviewInput] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("Deployed 7 AI workspace modules, reached 142 registered founders, achieved 72% 30-day retention.");
  const [tractionInput, setTractionInput] = useState("142 Registered Users, 98 MAU, $2,450 MRR (+35% MoM), 72% Retention Rate");
  const [progressInput, setProgressInput] = useState("Gemini AI prompt engine integrated with MongoDB Atlas persistence and auto-fallbacks.");
  const [challengesInput, setChallengesInput] = useState("Scaling top-of-funnel acquisition from manual founder outreach to automated viral referral loop.");
  const [goalsInput, setGoalsInput] = useState("Scale to 500 active users, hit $5,000 MRR, and close Pre-Seed funding round.");
  const [fundingInput, setFundingInput] = useState("Raising $500k Pre-Seed round ($100k committed) to accelerate engineering and user acquisition.");

  // Data State
  const [updateDoc, setUpdateDoc] = useState<InvestorUpdateData | null>(null);
  const [editableLetter, setEditableLetter] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "Untitled Venture");
      setOverviewInput(venture.brief?.building || "AI Execution Operating System for Startup Founders");
      loadInvestorUpdateHistory();
    }
  }, [venture?.id]);

  async function loadInvestorUpdateHistory() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getInvestorUpdateHistoryModule(venture.id);
      if (res.success && res.data?.investorUpdate) {
        setUpdateDoc(res.data.investorUpdate);
        setEditableLetter(res.data.investorUpdate.generatedUpdateText || "");
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load investor update history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInvestorUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!venture?.id || generating) return;

    setGenerating(true);
    try {
      const res = await api.generateInvestorUpdateModule({
        ventureId: venture.id,
        ventureName: ventureNameInput,
        overview: overviewInput,
        progress: progressInput,
        traction: tractionInput,
        challenges: challengesInput,
        goals: goalsInput,
        funding: fundingInput,
      });

      if (res.success && res.data?.investorUpdate) {
        setUpdateDoc(res.data.investorUpdate);
        setEditableLetter(res.data.investorUpdate.generatedUpdateText || "");
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.investorUpdate, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to generate investor update:", err);
    } finally {
      setGenerating(false);
    }
  }

  function handlePrintExportPDF() {
    window.print();
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  return (
    <>
      <PageHeader
        eyebrow="Step 09"
        title="Investor Update AI Generator"
        description="AI IR Expert aggregates startup traction, roadmap milestones, and financial progress into an executive memorandum."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Saved Updates</span>
              </div>
            )}

            {/* Component 7: Export PDF Button */}
            <button
              onClick={handlePrintExportPDF}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#141C28] px-3.5 py-2 text-xs font-semibold text-[#F5F8FC] hover:bg-white/10 transition"
            >
              <Printer className="size-4 text-[#64D8FF]" />
              Export PDF / Print
            </button>

            <button
              onClick={() => void handleGenerateInvestorUpdate()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(100,216,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Generating..." : "Generate Investor Update"}
            </button>
          </div>
        }
      />

      {/* Generated from Founder Conversation Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#64D8FF]" />
        <div>
          <span className="font-bold text-[#64D8FF]">AI Investor Relations Active: </span>
          Input your latest startup achievements and funding needs below to generate an executive investor memorandum saved into MongoDB.
        </div>
      </div>

      {/* Inputs Form */}
      <Panel title="Executive Investor Update Inputs">
        <form onSubmit={handleGenerateInvestorUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venture Name">
              <TextInput value={ventureNameInput} onChange={(e) => setVentureNameInput(e.target.value)} />
            </Field>
            <Field label="Company Overview">
              <TextInput value={overviewInput} onChange={(e) => setOverviewInput(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Recent Traction Highlights">
              <TextArea rows={2} value={tractionInput} onChange={(e) => setTractionInput(e.target.value)} />
            </Field>
            <Field label="Product & Technical Progress">
              <TextArea rows={2} value={progressInput} onChange={(e) => setProgressInput(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Key Milestones">
              <TextArea rows={2} value={milestonesInput} onChange={(e) => setMilestonesInput(e.target.value)} />
            </Field>
            <Field label="Current Challenges & Mitigations">
              <TextArea rows={2} value={challengesInput} onChange={(e) => setChallengesInput(e.target.value)} />
            </Field>
            <Field label="Next Quarter Goals">
              <TextArea rows={2} value={goalsInput} onChange={(e) => setGoalsInput(e.target.value)} />
            </Field>
          </div>

          <Field label="Funding Needs & Round Details">
            <TextInput value={fundingInput} onChange={(e) => setFundingInput(e.target.value)} placeholder="e.g. Raising $500k Pre-Seed round ($100k committed)" />
          </Field>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(79,140,255,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Writing Memorandum..." : "Generate Investor Update"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading Animation */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#64D8FF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Drafting Executive Investor Memorandum...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Aggregating milestones, financial traction, challenges, and next quarter goals</p>
          </div>
        </div>
      )}

      {/* 7 Components Dashboard Display */}
      {updateDoc && !generating && (
        <div className="space-y-6">
          {/* Component 1: Company Summary Card */}
          <div className="rounded-2xl border border-[#64D8FF]/40 bg-[#0E131C] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
                1. Company Executive Summary — {updateDoc.period?.month || "Current Period"} ({updateDoc.period?.quarter || "Q3 2026"})
              </span>
              <span className="text-xs font-mono text-[#46E3A3]">Investor Ready</span>
            </div>
            <p className="text-sm font-medium text-[#F5F8FC] leading-relaxed">{updateDoc.investorMessage?.summary}</p>
          </div>

          {/* Component 2 & 3: Milestone Timeline & Traction Highlights */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 2: Milestone Timeline */}
            <Panel title="2. Milestone Achievements Timeline">
              <ul className="space-y-2 text-xs">
                {updateDoc.investorMessage?.keyAchievements?.map((ach, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <Flag className="size-4 text-[#46E3A3] shrink-0" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Component 3: Traction Highlights */}
            <Panel title="3. Growth & Revenue Traction Highlights">
              <ul className="space-y-2 text-xs">
                {updateDoc.investorMessage?.growthMetrics?.map((met, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[#E1F4FF] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <TrendingUp className="size-4 text-[#64D8FF] shrink-0" />
                    <span>{met}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Component 4: Investor Letter Preview */}
          <Panel
            title="4. Official Investor Letter Memorandum"
            action={
              <CopyButton text={editableLetter}>
                Copy Letter Markdown
              </CopyButton>
            }
          >
            <div className="space-y-3">
              <TextArea
                rows={14}
                value={editableLetter}
                onChange={(e) => setEditableLetter(e.target.value)}
                className="font-mono text-xs text-[#F5F8FC] bg-[#0A0D14] p-4 rounded-xl border border-white/10"
              />
              <p className="text-[11px] text-[#A8B3C7]">
                Tip: You can directly edit the text above before copying or exporting as PDF.
              </p>
            </div>
          </Panel>

          {/* Component 5 & 6: Next Quarter Goals & Funding Requirement */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 5: Next Quarter Goals */}
            <Panel title="5. Next Quarter Objectives">
              <ul className="space-y-2 text-xs">
                {updateDoc.investorMessage?.nextQuarterGoals?.map((goal, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="size-4 text-[#64D8FF] shrink-0" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Component 6: Funding Requirement Section */}
            <Panel title="6. Funding & Capital Requirements">
              <div className="rounded-xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 p-4 text-xs space-y-2">
                <span className="font-mono font-bold text-[#46E3A3] text-[10px] uppercase flex items-center gap-1.5">
                  <DollarSign className="size-4" /> Capital & Round Status
                </span>
                <p className="text-[#F5F8FC] text-sm font-semibold">{updateDoc.investorMessage?.fundingNeeds || fundingInput}</p>
              </div>
            </Panel>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Investor Update</Button>
        <LinkButton to="/workspace/idea-validation" variant="primary">
          Back to AI Chat & Validation
        </LinkButton>
      </div>
    </>
  );
}