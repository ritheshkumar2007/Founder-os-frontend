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
import { Sparkles, RefreshCw, Printer, Copy, CheckCircle2, History, TrendingUp, Flag, ShieldAlert, DollarSign, FileText, AlertCircle } from "lucide-react";
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

function InvestorPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs (clean inputs - auto-inherits from Venture Memory if present)
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [overviewInput, setOverviewInput] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");
  const [tractionInput, setTractionInput] = useState("");
  const [progressInput, setProgressInput] = useState("");
  const [challengesInput, setChallengesInput] = useState("");
  const [goalsInput, setGoalsInput] = useState("");
  const [fundingInput, setFundingInput] = useState("");

  // Data State
  const [updateDoc, setUpdateDoc] = useState<InvestorUpdateData | null>(null);
  const [editableLetter, setEditableLetter] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const ventureId = venture?.id || (venture as any)?._id || "6a709d6ff4af39139e040cc8";
  const hasVentureMemory = Boolean(venture?.brief?.building || venture?.mvpScope?.mustHaveFeatures?.length || venture?.name);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setOverviewInput(venture.brief?.building || "");
      loadInvestorUpdateHistory();
    } else {
      loadInvestorUpdateHistory();
    }
  }, [ventureId]);

  async function loadInvestorUpdateHistory() {
    setLoading(true);
    try {
      const res = await api.getInvestorUpdateHistoryModule(ventureId);
      if (res.success && res.data?.investorUpdate) {
        setUpdateDoc(res.data.investorUpdate);
        setEditableLetter(res.data.investorUpdate.generatedUpdateText || "");
        setHistory(res.data.history || []);
      } else {
        setUpdateDoc(null);
      }
    } catch (err) {
      console.warn("Failed to load investor update history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateInvestorUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;

    setGenerating(true);
    try {
      const res = await api.generateInvestorUpdateModule({
        ventureId,
        ventureName: ventureNameInput || "Untitled Venture",
        overview: overviewInput || "Startup Concept",
        milestones: milestonesInput || "MVP scope finalized & technical architecture built",
        traction: tractionInput || "Pre-Launch / Pre-Traction discovery",
        progress: progressInput || "Core resolution engine implemented & tested",
        challenges: challengesInput || "Initial customer discovery & beta tester intake",
        goals: goalsInput || "Acquire first 10–25 active test users",
        funding: fundingInput || "Bootstrap / Pre-Seed discovery",
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

  return (
    <>
      <PageHeader
        eyebrow="Step 09"
        title="Investor & Advisor Update Generator"
        description="AI Investor Relations generator creates executive update memorandums, milestone breakdowns, and evidence-based traction highlights."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Updates Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateInvestorUpdate()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(100,216,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "AI Is Drafting Update..." : "Generate Investor Update"}
            </button>
          </div>
        }
      />

      {/* Banner */}
      {hasVentureMemory ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
          <Sparkles className="size-5 shrink-0 text-[#64D8FF]" />
          <div>
            <span className="font-bold text-[#64D8FF]">Venture Memory Active: </span>
            Auto-inherited your startup brief, MVP progress, and traction signals. Customize parameters below to generate your executive investor memorandum.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold text-amber-300">No Venture Memory Recorded: </span>
            Input your startup parameters below or complete previous modules to auto-populate your update memo.
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <Panel title="Investor Memorandum Inputs">
        <form onSubmit={handleGenerateInvestorUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venture / Company Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="e.g. Acme SaaS or leave blank"
              />
            </Field>
            <Field label="Traction & Key Metrics">
              <TextInput
                value={tractionInput}
                onChange={(e) => setTractionInput(e.target.value)}
                placeholder="e.g. Pre-Launch or 10 active test users"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Overview & Product Concept">
              <TextArea
                rows={2}
                value={overviewInput}
                onChange={(e) => setOverviewInput(e.target.value)}
                placeholder="Describe what your company builds"
              />
            </Field>
            <Field label="Product Engineering Progress">
              <TextArea
                rows={2}
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                placeholder="Key technical milestones completed"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Challenges & Focus Areas">
              <TextInput
                value={challengesInput}
                onChange={(e) => setChallengesInput(e.target.value)}
                placeholder="e.g. Initial customer intake velocity"
              />
            </Field>
            <Field label="Next Milestone Goals">
              <TextInput
                value={goalsInput}
                onChange={(e) => setGoalsInput(e.target.value)}
                placeholder="e.g. Acquire first 10–25 active test users"
              />
            </Field>
            <Field label="Funding Status / Capital Needs">
              <TextInput
                value={fundingInput}
                onChange={(e) => setFundingInput(e.target.value)}
                placeholder="e.g. Bootstrap / Pre-Seed"
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(79,140,255,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Drafting Update..." : "Generate Investor Update"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#64D8FF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Drafting Investor Memorandum & Metrics Summary...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Synthesizing milestones, traction signals, product updates, and next quarter goals</p>
          </div>
        </div>
      )}

      {/* Investor Update Content Display */}
      {updateDoc && !generating && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-[#64D8FF]/40 bg-[#0E131C] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
                Executive Update Summary
              </span>
              <CopyButton content={editableLetter} />
            </div>
            <p className="text-sm text-[#F5F8FC] leading-relaxed pt-1">{updateDoc.investorMessage?.summary}</p>
          </div>

          {/* 4 Performance Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Key Achievements">
              <ul className="space-y-2">
                {updateDoc.investorMessage?.keyAchievements?.map((a, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Traction & Growth Signals">
              <ul className="space-y-2">
                {updateDoc.investorMessage?.growthMetrics?.map((m, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#64D8FF] bg-[#141C28] p-3 rounded-xl border border-[#64D8FF]/20">
                    <TrendingUp className="size-4 text-[#64D8FF] shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Challenges & Next Quarter Goals */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Challenges & Mitigations">
              <ul className="space-y-2">
                {updateDoc.investorMessage?.challenges?.map((c, i) => (
                  <li key={i} className="rounded-xl bg-[#141C28] p-3 border border-red-500/20 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                      <ShieldAlert className="size-3.5 text-red-400 shrink-0" />
                      <span>{c}</span>
                    </div>
                    {updateDoc.investorMessage?.solutions?.[i] && (
                      <p className="text-[#A8B3C7] text-[11px] pl-5">
                        Mitigation: {updateDoc.investorMessage.solutions[i]}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Next Quarter Goals">
              <ul className="space-y-2">
                {updateDoc.investorMessage?.nextQuarterGoals?.map((g, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[#F5F8FC] bg-[#141C28] p-3 rounded-xl border border-white/10">
                    <Flag className="size-4 text-[#64D8FF] shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Full Formatted Letter */}
          <Panel title="Formatted Investor Memorandum (Editable)">
            <div className="space-y-3">
              <textarea
                rows={12}
                value={editableLetter}
                onChange={(e) => setEditableLetter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0E131C] p-4 text-xs font-mono text-[#F5F8FC] focus:border-[#64D8FF] focus:outline-none leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <CopyButton content={editableLetter} />
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Empty State Banner when no update has been generated yet */}
      {!updateDoc && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0E131C] p-12 text-center space-y-3">
          <FileText className="size-10 text-[#64D8FF]/60" />
          <h3 className="text-base font-bold text-[#F5F8FC]">No Investor Update Generated Yet</h3>
          <p className="max-w-md text-xs text-[#A8B3C7] font-sans">
            Review your startup parameters in the form above, then click <strong>Generate Investor Update</strong> to create an evidence-based executive memorandum.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Investor Update</Button>
        <LinkButton to="/workspace/idea-validation" variant="primary">
          Back to AI Founder Coach
        </LinkButton>
      </div>
    </>
  );
}