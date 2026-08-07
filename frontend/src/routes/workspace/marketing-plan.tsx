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
import { Sparkles, RefreshCw, UserCheck, Megaphone, Calendar, Rocket, LineChart, Clock, History, CheckCircle2, AlertCircle } from "lucide-react";
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

function formatMarketingStrategy(raw: any, fallbackName: string, audienceInput: string, goalInput: string): MarketingStrategyData {
  const data = raw?.marketingStrategy || raw || {};
  const audience = audienceInput || "target customers";
  const goal = goalInput ? `Goal: ${goalInput}` : "Acquire initial 20–50 paying customers";

  const brandPositioning = data.brandPositioning || `${fallbackName || "FounderOS"}: The AI-powered execution engine tailored for ${audience}. Turn manual startup tasks into automated, high-converting workflows in seconds.`;

  const valueProposition = data.valueProposition || `"Build, validate, and launch your startup 10x faster without wasting time on manual document creation or fragmented AI tools."`;

  const customerPersona = (Array.isArray(data.customerPersona) && data.customerPersona.length > 0)
    ? data.customerPersona
    : [
        {
          name: "Alex the Early-Stage Builder",
          age: "24–36",
          painPoints: `Struggling to structure execution roadmaps and acquire early test users for ${audience}.`,
          needs: "Fast, automated execution tools that turn ideas into launchable MVP scopes & GTM plans.",
          behavior: "Active on community hubs, niche forums, Reddit, and LinkedIn.",
        },
      ];

  const marketingChannels = (Array.isArray(data.marketingChannels) && data.marketingChannels.length > 0)
    ? data.marketingChannels
    : [
        {
          channel: "Direct 1-on-1 Founder Outreach",
          purpose: "Target Customer Intake & Feedback",
          strategy: `Send personalized 3-sentence value propositions to 20 ${audience}/day offering free strategy teardowns.`,
        },
        {
          channel: "Niche Community & Build in Public",
          purpose: "Organic Trust & Early Adoption",
          strategy: "Post weekly breakdowns of milestones, user metrics, and raw build updates in relevant founder communities.",
        },
      ];

  const contentStrategy = (Array.isArray(data.contentStrategy) && data.contentStrategy.length > 0)
    ? data.contentStrategy
    : [
        {
          platform: "Primary Community Hub",
          contentType: "Build in Public Updates & Product Demos",
          frequency: "3 Posts / Week",
        },
        {
          platform: "Direct Outreach / Email",
          contentType: "1-on-1 Personal Strategy Invites",
          frequency: "Daily Cohort",
        },
      ];

  const launchCampaign = data.launchCampaign || {
    preLaunch: `Collect initial 50 waitlist leads from ${audience} via 1-page landing page teaser.`,
    launchDay: "Direct launch message to waitlist subscribers and post in pre-engaged community channels.",
    postLaunch: "Onboard initial cohort with 1-on-1 feedback calls and publish week 1 milestone metrics.",
  };

  const growthStrategies = (Array.isArray(data.growthStrategies) && data.growthStrategies.length > 0)
    ? data.growthStrategies
    : [
        "Incentivized Referral Loop: Offer 1 month free for referring 2 fellow target founders.",
        "Programmatic Landing Pages: Target high-intent search queries relevant to the core problem.",
      ];

  const budgetAllocation = (data.budgetAllocation && Object.keys(data.budgetAllocation).length > 0)
    ? data.budgetAllocation
    : {
        "Direct Outreach Tools & CRM": "$50",
        "Domain & Hosting Infrastructure": "$30",
        "Micro-Creator Content & Assets": "$100",
      };

  const metricsToTrack = (Array.isArray(data.metricsToTrack) && data.metricsToTrack.length > 0)
    ? data.metricsToTrack
    : [
        "Website Visitors to Signup Conversion Rate (Target: >15%)",
        "First-Week Active User Retention (Target: >40%)",
        "Customer Acquisition Cost (CAC) vs Lifetime Value (LTV Target: >3:1)",
      ];

  const ninetyDayRoadmap = (Array.isArray(data.ninetyDayRoadmap) && data.ninetyDayRoadmap.length > 0)
    ? data.ninetyDayRoadmap
    : [
        {
          month: "Month 1: Foundation & Initial 25 Users",
          goals: goal,
          actions: [
            "Finalize landing page copy & value proposition",
            "Execute direct 1-on-1 outreach campaign",
            "Conduct 10 direct onboarding calls with early users",
          ],
        },
        {
          month: "Month 2: Channel Scaling & 50 Paying Customers",
          goals: "Scale outreach and build-in-public content pipeline.",
          actions: [
            "Ramp cold outreach to targeted prospects per day",
            "Publish weekly case studies of successful user workflows",
            "Launch referral loop within workspace UI",
          ],
        },
        {
          month: "Month 3: Revenue Acceleration & 100 Customers",
          goals: "Automate organic acquisition engine.",
          actions: [
            "Optimize pricing tiers and upsell premium features",
            "Expand programmatic SEO pages for high-intent keywords",
            "Prepare monthly investor update memo with growth metrics",
          ],
        },
      ];

  return {
    brandPositioning,
    customerPersona,
    valueProposition,
    marketingChannels,
    contentStrategy,
    launchCampaign,
    growthStrategies,
    budgetAllocation,
    metricsToTrack,
    ninetyDayRoadmap,
  };
}

function MarketingPage() {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Inputs (clean inputs - auto-inherits from Venture Memory if present)
  const [ventureNameInput, setVentureNameInput] = useState("");
  const [startupIdeaInput, setStartupIdeaInput] = useState("");
  const [mvpScopeInput, setMvpScopeInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const [pricingInput, setPricingInput] = useState("");
  const [goalInput, setGoalInput] = useState("");

  // Marketing Strategy Data
  const [strategy, setStrategy] = useState<MarketingStrategyData | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const ventureId = venture?.id || (venture as any)?._id || "6a709d6ff4af39139e040cc8";
  const hasVentureMemory = Boolean(venture?.brief?.building || venture?.brief?.audience || venture?.name);

  useEffect(() => {
    if (venture) {
      setVentureNameInput(venture.name || venture.ventureName || "");
      setStartupIdeaInput(venture.brief?.building || "");
      setMvpScopeInput(venture.mvpScope?.mustHaveFeatures?.join(", ") || venture.mvp?.job || "");
      setAudienceInput(venture.brief?.audience || "");
      setIndustryInput("B2B SaaS / Productivity");
      setPricingInput("Freemium ($29/mo Pro Tier)");
      setGoalInput("Acquire first 100 paying customers in 60 days");
      loadMarketingPlanHistory();
    } else {
      loadMarketingPlanHistory();
    }
  }, [ventureId]);

  async function loadMarketingPlanHistory() {
    setLoading(true);
    try {
      const res = await api.getMarketingPlanHistory(ventureId);
      if (res.success && res.data?.marketingPlan) {
        const formatted = formatMarketingStrategy(res.data.marketingPlan, ventureNameInput, audienceInput, goalInput);
        setStrategy(formatted);
        setHistory(res.data.history || []);
      } else {
        setStrategy(null);
      }
    } catch (err) {
      console.warn("Failed to load marketing plan history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateMarketingPlan(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (generating) return;

    setGenerating(true);
    try {
      const res = await api.generateMarketingPlanModule({
        ventureId,
        ventureName: ventureNameInput || "Untitled Venture",
        startupIdea: startupIdeaInput || "Startup Concept",
        mvpScope: mvpScopeInput || "2-week MVP scope",
        audience: audienceInput || "Target Customers",
        industry: industryInput || "B2B SaaS",
        pricing: pricingInput || "Freemium ($29/mo)",
        goal: goalInput || "Acquire first 50 test users",
      });

      if (res.success && res.data?.marketingPlan) {
        const formatted = formatMarketingStrategy(res.data.marketingPlan, ventureNameInput, audienceInput, goalInput);
        setStrategy(formatted);
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

  return (
    <>
      <PageHeader
        eyebrow="Step 06"
        title="Marketing Plan & GTM Generator"
        description="AI Chief Marketing Officer (CMO) designs a high-converting Go-To-Market strategy, customer personas, channel boards, and 90-day roadmap."
        right={
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#0E131C] px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A8B3C7]">
                <History className="size-3.5 text-[#64D8FF]" />
                <span className="font-mono text-xs text-[#F5F8FC]">{history.length} Plans Saved</span>
              </div>
            )}

            <button
              onClick={() => void handleGenerateMarketingPlan()}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl border border-[#64D8FF]/40 bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 shadow-[0_0_20px_rgba(100,216,255,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${generating ? "animate-spin text-black" : ""}`} />
              {generating ? "AI CMO Is Crafting Strategy..." : "Generate Marketing Plan"}
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
            Auto-inherited your target audience & MVP scope from Steps 1 & 4. Review parameters below to generate your 90-day GTM roadmap.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold text-amber-300">No Target Customer Memory: </span>
            Input your target audience in the form below or complete Step 1 (Idea Validation) to auto-populate parameters.
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <Panel title="Go-To-Market Inputs">
        <form onSubmit={handleGenerateMarketingPlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Venture Name">
              <TextInput
                value={ventureNameInput}
                onChange={(e) => setVentureNameInput(e.target.value)}
                placeholder="e.g. Acme SaaS or leave blank"
              />
            </Field>
            <Field label="Industry / Niche">
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
                placeholder="e.g. Freemium ($29/mo Pro Tier)"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Target Audience / Persona Segment">
              <TextArea
                rows={2}
                value={audienceInput}
                onChange={(e) => setAudienceInput(e.target.value)}
                placeholder="Describe your ideal customers"
              />
            </Field>
            <Field label="Primary Growth Goal">
              <TextArea
                rows={2}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Acquire first 100 paying customers in 60 days"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#64D8FF] px-5 py-2.5 text-xs font-extrabold text-black transition hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(79,140,255,0.4)]"
            >
              <Sparkles className="size-4" /> {generating ? "AI CMO Is Crafting Strategy..." : "Generate Marketing Plan"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[#64D8FF]/30 bg-[#0E131C]/90 p-8 shadow-2xl">
          <RefreshCw className="size-8 animate-spin text-[#64D8FF]" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-[#F5F8FC]">AI CMO Is Crafting Your GTM Strategy...</h3>
            <p className="text-xs font-mono text-[#A8B3C7]">Analyzing customer personas, acquisition channel matrix, brand positioning, and 90-day roadmap</p>
          </div>
        </div>
      )}

      {/* Marketing Output Display */}
      {strategy && !generating && (
        <div className="space-y-6">
          {/* Brand Positioning & Value Prop Header */}
          <div className="rounded-2xl border border-[#64D8FF]/40 bg-[#0E131C] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64D8FF] bg-[#64D8FF]/10 px-2.5 py-1 rounded-lg border border-[#64D8FF]/20">
                Brand Positioning & Value Prop
              </span>
              <CopyButton content={`${strategy.brandPositioning}\n\nHero Headline: ${strategy.valueProposition}`} />
            </div>
            <p className="text-sm font-semibold text-[#F5F8FC] leading-relaxed">{strategy.brandPositioning}</p>
            <div className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs font-mono text-[#64D8FF] italic">
              Hero Headline: {strategy.valueProposition}
            </div>
          </div>

          {/* Customer Personas */}
          <Panel title="Target Customer Personas">
            <div className="grid gap-4 sm:grid-cols-2">
              {strategy.customerPersona?.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-4 text-[#64D8FF]" />
                      <h4 className="text-sm font-bold text-[#F5F8FC]">{p.name}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-[#A8B3C7] bg-white/5 px-2 py-0.5 rounded-md">
                      Age: {p.age}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-red-300 block">Pain Points:</span>
                      <p className="text-[#A8B3C7]">{p.painPoints}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#46E3A3] block">Core Needs:</span>
                      <p className="text-[#F5F8FC]">{p.needs}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#64D8FF] block">Online Behavior:</span>
                      <p className="text-[#A8B3C7]">{p.behavior}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Acquisition Channels Matrix */}
          <Panel title="Customer Acquisition Channels Matrix">
            <div className="grid gap-4 sm:grid-cols-2">
              {strategy.marketingChannels?.map((ch, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F8FC] text-sm">{ch.channel}</span>
                    <span className="text-[10px] font-mono text-[#64D8FF] bg-[#64D8FF]/10 px-2 py-0.5 rounded-md border border-[#64D8FF]/20">
                      {ch.purpose}
                    </span>
                  </div>
                  <p className="text-xs text-[#A8B3C7] leading-relaxed">{ch.strategy}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Content Strategy & Posting Schedule */}
          <Panel title="Content Strategy & Posting Schedule">
            <div className="grid gap-3 sm:grid-cols-3">
              {strategy.contentStrategy?.map((c, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-4 text-xs space-y-1.5">
                  <span className="font-mono text-[10px] text-[#64D8FF] font-bold uppercase">{c.platform}</span>
                  <p className="font-semibold text-[#F5F8FC]">{c.contentType}</p>
                  <span className="inline-block text-[11px] font-mono text-[#46E3A3] bg-[#46E3A3]/10 px-2 py-0.5 rounded-md">
                    {c.frequency}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* 3-Stage Launch Campaign Plan */}
          <Panel title="3-Stage Product Launch Campaign">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-[#141C28] p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#64D8FF]">Stage 1: Pre-Launch Teaser</span>
                <p className="text-xs text-[#F5F8FC] leading-relaxed">{strategy.launchCampaign?.preLaunch}</p>
              </div>

              <div className="rounded-xl border border-[#64D8FF]/30 bg-[#64D8FF]/10 p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#64D8FF]">Stage 2: Launch Day Push</span>
                <p className="text-xs text-[#F5F8FC] leading-relaxed font-semibold">{strategy.launchCampaign?.launchDay}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#141C28] p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#46E3A3]">Stage 3: Post-Launch Retargeting</span>
                <p className="text-xs text-[#A8B3C7] leading-relaxed">{strategy.launchCampaign?.postLaunch}</p>
              </div>
            </div>
          </Panel>

          {/* 90-Day Execution Roadmap */}
          <Panel title="90-Day Go-To-Market Execution Roadmap">
            <div className="space-y-4">
              {strategy.ninetyDayRoadmap?.map((m, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-[#141C28] p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <h4 className="text-sm font-bold text-[#F5F8FC]">{m.month}</h4>
                    <span className="text-xs font-mono text-[#64D8FF] bg-[#64D8FF]/10 px-3 py-1 rounded-full border border-[#64D8FF]/20">
                      Goal: {m.goals}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#A8B3C7]">
                    {m.actions?.map((act, ai) => (
                      <li key={ai} className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-[#46E3A3] shrink-0" />
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

      {/* Empty State Banner when no marketing plan has been generated yet */}
      {!strategy && !generating && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0E131C] p-12 text-center space-y-3">
          <Megaphone className="size-10 text-[#64D8FF]/60" />
          <h3 className="text-base font-bold text-[#F5F8FC]">No Marketing Strategy Generated Yet</h3>
          <p className="max-w-md text-xs text-[#A8B3C7] font-sans">
            Review your target audience and growth goals in the form above, then click <strong>Generate Marketing Plan</strong> to craft your Go-To-Market positioning and 90-day execution roadmap.
          </p>
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