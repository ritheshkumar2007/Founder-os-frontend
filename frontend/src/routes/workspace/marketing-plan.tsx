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
import { Sparkles, RefreshCw, UserCheck, Megaphone, Calendar, Rocket, LineChart, Clock, History, CheckCircle2 } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "Marketing Plan — FounderOS";
const DESCRIPTION = "AI-generated Go-To-Market marketing strategy, customer personas, channel boards, and 90-day roadmap.";

export const Route = createFileRoute("/workspace/marketing-plan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MarketingPage,
});

export interface MarketingStrategyData {
  brandPositioning: string;
  customerPersona: { name: string; age: string; painPoints: string; needs: string; behavior: string }[];
  valueProposition: string;
  marketingChannels: { channel: string; purpose: string; strategy: string }[];
  contentStrategy: { platform: string; contentType: string; frequency: string }[];
  launchCampaign: { preLaunch: string; launchDay: string; postLaunch: string };
  growthStrategies: string[];
  budgetAllocation: Record<string, string>;
  metricsToTrack: string[];
  ninetyDayRoadmap: { month: string; goals: string; actions: string[] }[];
}

function MarketingPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [startupIdeaInput, setStartupIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [industryInput, setIndustryInput] = useState("B2B SaaS / Productivity");
  const [pricingInput, setPricingInput] = useState("Freemium ($29/mo Pro Tier)");
  const [goalInput, setGoalInput] = useState("Acquire first 100 paying customers in 60 days");

  // Marketing Strategy Data
  const [strategy, setStrategy] = useState<MarketingStrategyData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "Untitled Venture");
      setStartupIdeaInput(venture.brief?.building || "AI Execution Operating System for Startup Founders");
      setMvpScopeInput(venture.mvp?.job || "2-week MVP scope");
      setAudienceInput(venture.brief?.audience || "Early-stage founders, SaaS builders, Indie hackers");
      loadMarketingPlanHistory();
    }
  }, [venture?.id]);

  async function loadMarketingPlanHistory() {
    if (!venture?.id) return;
    setLoading(true);
    try {
      const res = await api.getMarketingPlanHistory(venture.id);
      if (res.success && res.data?.marketingPlan) {
        setStrategy(res.data.marketingPlan.marketingStrategy || null);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.warn("Failed to load marketing plan history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateMarketingPlan(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!venture?.id || generating) return;

    setGenerating(true);
    try {
      const res = await api.generateMarketingPlanModule({
        ventureId: venture.id,
        ventureName: ventureNameInput,
        startupIdea: startupIdeaInput,
        mvpScope: mvpScopeInput,
        audience: audienceInput,
        industry: industryInput,
        pricing: pricingInput,
        goal: goalInput,
      });

      if (res.success && res.data?.marketingPlan) {
        setStrategy(res.data.marketingPlan.marketingStrategy);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setHistory((prev) => [res.data.marketingPlan, ...prev]);
        }
      }
    } catch (err) {
      console.warn("Failed to generate marketing plan:", err);
    } finally {
      setGenerating(false);
    }
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  return (
    <>
      <PageHeader
        eyebrow="Step 06"
        title="Marketing Plan AI Generator"
        description="AI Chief Marketing Officer designs your Go-To-Market strategy, personas, channel board, and 90-day roadmap."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Saved GTM Plans</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateMarketingPlan()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(100,216,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "Generating..." : "Generate Marketing Plan"}
            </button>
          </div>
        }
      />

      {/* Generated from Founder Conversation Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 text-xs text-[#E1F4FF] shadow-sm">
        <Sparkles className="size-5 shrink-0 text-[#64D8FF]" />
        <div>
          <span className="font-bold text-[#64D8FF]">AI CMO Active: </span>
          Input your GTM parameters below to generate a 10-part marketing plan saved directly into MongoDB.
        </div>
      </div>

      {/* Inputs Form */}
      <Panel title="GTM Marketing Strategy Inputs">
        <form onSubmit={handleGenerateMarketingPlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="Venture name"
              />
            </Field>
            <Field label="Industry">
              <TextInput
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                placeholder="e.g. B2B SaaS / Productivity"
              />
            </Field>
            <Field label="Pricing Model">
              <TextInput
                value={pricingInput}
                onChange={(e) => setPricingInput(e.target.value)}
                placeholder="e.g. Freemium ($29/mo)"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Target Audience">
              <TextArea
                rows={2}
                value={audienceInput}
                onChange={(e) => setAudienceInput(e.target.value)}
                placeholder="Describe target ICP customer segments"
              />
            </Field>
            <Field label="30–90 Day Launch Goal">
              <TextArea
                rows={2}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Describe key acquisition goal"
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(79,140,255,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI Is Planning Strategy..." : "Generate Marketing Plan"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading Animation */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#64D8FF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">Constructing GTM Marketing Blueprint...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Analyzing customer personas, acquisition channels, content strategy, and 90-day roadmap</p>
          </div>
        </div>
      )}

      {/* 7 Components Marketing Display */}
      {strategy && !generating && (
        <div className="space-y-6">
          {/* Component 1: Brand Strategy Card */}
          <div className="rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
                1. Brand Strategy & Positioning
              </span>
            </div>
            <div>
              <h4 className="text-xs font-mono uppercase text-[#A8B3C7]">Brand Positioning</h4>
              <p className="text-sm font-semibold text-[#F5F8FC] mt-1">{strategy.brandPositioning}</p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <h4 className="text-xs font-mono uppercase text-[#46E3A3]">Unique Value Proposition (UVP)</h4>
              <p className="text-sm font-medium text-[#E1F4FF] mt-1">{strategy.valueProposition}</p>
            </div>
          </div>

          {/* Component 2: Customer Persona Cards */}
          <Panel title="2. Target Customer Personas">
            <div className="grid gap-4 sm:grid-cols-2">
              {strategy.customerPersona?.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F8FC] text-sm flex items-center gap-2">
                      <UserCheck className="size-4 text-[#64D8FF]" />
                      {p.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#A8B3C7]">{p.age}</span>
                  </div>
                  <p className="text-red-300"><strong>Pain Points: </strong>{p.painPoints}</p>
                  <p className="text-emerald-300"><strong>Needs: </strong>{p.needs}</p>
                  <p className="text-[#A8B3C7]"><strong>Behavior: </strong>{p.behavior}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Component 3: Channel Strategy Board */}
          <Panel title="3. Marketing Channel Acquisition Board">
            <div className="grid gap-4 sm:grid-cols-3">
              {strategy.marketingChannels?.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-2">
                  <span className="font-bold text-[#64D8FF] text-sm flex items-center gap-2">
                    <Megaphone className="size-4 text-[#64D8FF]" />
                    {c.channel}
                  </span>
                  <p className="text-[#F5F8FC]"><strong>Purpose: </strong>{c.purpose}</p>
                  <p className="text-[#A8B3C7]"><strong>Strategy: </strong>{c.strategy}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Component 4 & 5: Content Calendar & Launch Campaign Timeline */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Component 4: Content Calendar */}
            <Panel title="4. Content Strategy & Calendar">
              <div className="space-y-2">
                {strategy.contentStrategy?.map((cs, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#141C28] p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-[#64D8FF] shrink-0" />
                      <div>
                        <span className="font-bold text-[#F5F8FC]">{cs.platform}</span>
                        <p className="text-[11px] text-[#A8B3C7]">{cs.contentType}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#46E3A3] bg-[#46E3A3]/10 px-2 py-1 rounded-lg border border-[#46E3A3]/20 shrink-0">
                      {cs.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Component 5: Launch Campaign Timeline */}
            <Panel title="5. Launch Campaign Sequence">
              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-[#141C28] p-3">
                  <span className="font-mono font-bold text-[#64D8FF] uppercase text-[10px]">Pre-Launch (Week -1)</span>
                  <p className="text-[#F5F8FC] mt-1">{strategy.launchCampaign?.preLaunch}</p>
                </div>
                <div className="rounded-xl border border-[#46E3A3]/30 bg-[#46E3A3]/10 p-3">
                  <span className="font-mono font-bold text-[#46E3A3] uppercase text-[10px]">Launch Day (Day 0)</span>
                  <p className="text-[#E1F4FF] mt-1">{strategy.launchCampaign?.launchDay}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#141C28] p-3">
                  <span className="font-mono font-bold text-[#A8B3C7] uppercase text-[10px]">Post-Launch (Week +1)</span>
                  <p className="text-[#F5F8FC] mt-1">{strategy.launchCampaign?.postLaunch}</p>
                </div>
              </div>
            </Panel>
          </div>

          {/* Component 6: Growth Metrics Dashboard */}
          <Panel title="6. Growth Metrics & Budget Dashboard">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#64D8FF]">Key Metrics To Track</span>
                <ul className="space-y-1.5">
                  {strategy.metricsToTrack?.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-[#F5F8FC] bg-[#141C28] p-2.5 rounded-xl border border-white/5">
                      <LineChart className="size-3.5 text-[#46E3A3] shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#46E3A3]">Budget Allocation</span>
                <div className="space-y-1.5 font-mono text-xs">
                  {strategy.budgetAllocation && Object.entries(strategy.budgetAllocation).map(([k, v], idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#141C28] p-2.5 text-[#A8B3C7]">
                      <span>{k}</span>
                      <strong className="text-[#64D8FF]">{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          {/* Component 7: 90-Day Roadmap Timeline */}
          <Panel title="7. 90-Day Marketing Execution Roadmap">
            <div className="grid gap-4 sm:grid-cols-3">
              {strategy.ninetyDayRoadmap?.map((m, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-2">
                  <span className="font-bold text-[#64D8FF] text-sm block">{m.month}</span>
                  <p className="text-emerald-300 font-semibold">Goal: {m.goals}</p>
                  <ul className="space-y-1 pt-1">
                    {m.actions?.map((act, ai) => (
                      <li key={ai} className="text-[#A8B3C7] text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-[#46E3A3] shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Marketing Plan</Button>
        <LinkButton to="/workspace/launch-sprint" variant="primary">
          Continue to Launch Sprint
        </LinkButton>
      </div>
    </>
  );
}