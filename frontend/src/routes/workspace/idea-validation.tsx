import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  CopyButton,
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
import { uid, useActiveVenture } from "@/lib/founderos/store";
import {
  analyzeValidation,
  problemStatement,
  riskiestAssumption,
  targetCustomer,
  valueProp,
  workaround,
} from "@/lib/founderos/derive";
import type { PainLevel, WouldPay } from "@/lib/founderos/types";
import { CheckCircle2, ChevronDown, ChevronUp, Lock, Sparkles, Edit3, ArrowRight, Info } from "lucide-react";

const TITLE = "Idea Validation Workspace — FounderOS";
const DESCRIPTION =
  "Complete your venture brief, run customer validation, and analyze real insights in one seamless continuous workspace.";

export const Route = createFileRoute("/workspace/idea-validation")({
  ssr: false,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IdeaValidationWorkspace,
});

const PLAN = [
  "Day 1: List 20 people who match your target customer.",
  "Day 2: Send the outreach message to the first 10.",
  "Day 3: Follow up and book interviews.",
  "Day 4: Run two interviews and log them here.",
  "Day 5: Run two more interviews.",
  "Day 6: Run your fifth interview and re-read your notes.",
  "Day 7: Review the pattern and decide your next move.",
];

const SCRIPT = [
  "Tell me about the last time this problem happened.",
  "What did you do to solve it?",
  "What was frustrating about the current approach?",
  "Have you tried another solution?",
  "Would you pay for a better solution?",
];

export function IdeaValidationWorkspace() {
  const { venture, update } = useActiveVenture();
  const [editingBrief, setEditingBrief] = useState(false);
  const [saveNoteStatus, setSaveNoteStatus] = useState<"Saved" | "Saving...">("Saved");
  const [initialBriefState, setInitialBriefState] = useState<string>("");

  const [interviewForm, setInterviewForm] = useState({
    name: "",
    role: "",
    quote: "",
    pain: "Medium" as PainLevel,
    pay: "Maybe" as WouldPay,
  });

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (venture?.brief) {
      const stateStr = JSON.stringify(venture.brief);
      if (!initialBriefState) {
        setInitialBriefState(stateStr);
      }
      setEditingBrief(!venture.brief.saved);
    }
  }, [venture?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  const b = venture.brief;
  const fields = [b.building, b.audience, b.problem, b.workaround, b.outcome];
  const filledCount = fields.filter((f) => f.trim()).length;
  const isBriefSaved = b.saved;

  const interviewCount = venture.interviews.length;
  const isStep2Unlocked = isBriefSaved || filledCount >= 2;
  const isStep3Unlocked = interviewCount >= 1;

  // Has key brief assumptions changed after interviews exist?
  const briefChangedNotice =
    isStep3Unlocked && initialBriefState && JSON.stringify(venture.brief) !== initialBriefState;

  const setBrief = (patch: Partial<typeof b>) =>
    update((v) => ({ ...v, brief: { ...v.brief, ...patch } }));

  const handleSaveBrief = () => {
    setBrief({ saved: true });
    setEditingBrief(false);

    // Smooth scroll to Step 2 & unlock
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleSaveNotes = (text: string) => {
    setSaveNoteStatus("Saving...");
    update((v) => ({ ...v, summaryNotes: text }));
    setTimeout(() => setSaveNoteStatus("Saved"), 500);
  };

  const a = analyzeValidation(venture);
  const repeatedWorkarounds = Array.from(
    new Set(venture.interviews.map((i) => i.quote).filter(Boolean)),
  ).slice(0, 3);

  const outreachMessage = `Hi — I'm researching how ${targetCustomer(venture)} deal with ${problemStatement(venture)}. I'm not selling anything; I'd love 15 minutes to hear how you handle it today. Would this week work?`;

  const canContinueToMvp = isBriefSaved && interviewCount >= 1 && venture.analyzed;

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <PageHeader
        eyebrow="Guided Workspace"
        title="Idea Validation Workspace"
        description="Venture Brief → Customer Validation → Validation Insights — all in one continuous guided workflow."
        right={
          <div className="w-60 space-y-1 text-right">
            <Progress
              value={
                !isBriefSaved
                  ? (filledCount / 5) * 33
                  : interviewCount === 0
                  ? 50
                  : Math.min(100, 66 + (interviewCount / 5) * 34)
              }
              label={
                !isBriefSaved
                  ? "Step 1: Venture Brief"
                  : interviewCount === 0
                  ? "Step 2: Customer Validation"
                  : `Step 3: ${interviewCount} Interview${interviewCount === 1 ? "" : "s"} Logged`
              }
            />
          </div>
        }
      />

      {/* Sticky Progress Indicator Navigation */}
      <div className="sticky top-0 z-20 rounded-2xl border border-border bg-background/95 p-3 backdrop-blur-md shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Step 1 Pill */}
          <button
            onClick={() => step1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
              isBriefSaved
                ? "bg-[#4F8CFF]/15 text-[#6AAEFF] border border-[#4F8CFF]/30 font-semibold"
                : "bg-surface text-foreground font-semibold shadow-sm"
            }`}
          >
            {isBriefSaved ? (
              <CheckCircle2 className="size-4 text-[#5AF2A2]" />
            ) : (
              <span className="size-2 rounded-full bg-[#4F8CFF] animate-ping" />
            )}
            <span>Step 1: Venture Brief</span>
          </button>

          <span className="text-muted-foreground/40 font-bold">→</span>

          {/* Step 2 Pill */}
          <button
            onClick={() => step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            disabled={!isStep2Unlocked}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
              interviewCount > 0
                ? "bg-[#4F8CFF]/15 text-[#6AAEFF] border border-[#4F8CFF]/30 font-semibold"
                : isStep2Unlocked
                ? "bg-surface text-foreground font-semibold shadow-sm"
                : "bg-surface/40 text-muted-foreground/50 cursor-not-allowed opacity-60"
            }`}
          >
            {interviewCount > 0 ? (
              <CheckCircle2 className="size-4 text-[#5AF2A2]" />
            ) : isStep2Unlocked ? (
              <span className="size-2 rounded-full bg-[#4F8CFF] animate-pulse" />
            ) : (
              <Lock className="size-3.5 text-muted-foreground" />
            )}
            <span>Step 2: Customer Validation</span>
          </button>

          <span className="text-muted-foreground/40 font-bold">→</span>

          {/* Step 3 Pill */}
          <button
            onClick={() => step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            disabled={!isStep3Unlocked}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
              venture.analyzed
                ? "bg-[#5AF2A2]/15 text-[#5AF2A2] border border-[#5AF2A2]/30 font-semibold"
                : isStep3Unlocked
                ? "bg-[#4F8CFF]/15 text-[#6AAEFF] border border-[#4F8CFF]/30 font-semibold animate-pulse"
                : "bg-surface/40 text-muted-foreground/50 cursor-not-allowed opacity-60"
            }`}
          >
            {venture.analyzed ? (
              <CheckCircle2 className="size-4 text-[#5AF2A2]" />
            ) : isStep3Unlocked ? (
              <Sparkles className="size-4 text-[#4F8CFF]" />
            ) : (
              <Lock className="size-3.5 text-muted-foreground" />
            )}
            <span>Step 3: Validation Insights</span>
          </button>
        </div>
      </div>

      {/* Non-blocking Notice when Brief Assumptions Change */}
      {briefChangedNotice ? (
        <div className="rounded-xl border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 p-4 text-xs text-[#6AAEFF] flex items-center gap-3">
          <Info className="size-4 shrink-0 text-[#4F8CFF]" />
          <span>Your validation assumptions changed. Review your interview plan and re-analyze the evidence.</span>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* STEP 1: VENTURE BRIEF */}
      {/* ========================================================================= */}
      <section ref={step1Ref} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-[#4F8CFF]/20 text-xs font-mono font-bold text-[#4F8CFF]">
              01
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">Step 1 — Venture Brief</h2>
          </div>
          {isBriefSaved && !editingBrief && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingBrief(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Edit3 className="size-3.5" /> Edit Venture Brief
            </Button>
          )}
        </div>

        {editingBrief ? (
          <Panel title="Venture Brief Form">
            <div className="space-y-5">
              <Field label="Venture name">
                <TextInput
                  value={venture.name}
                  onChange={(e) =>
                    update((v) => ({
                      ...v,
                      name: e.target.value,
                      investor: { ...v.investor, company: e.target.value },
                    }))
                  }
                  placeholder="e.g. FounderOS"
                />
              </Field>

              <Field label="What are you building?">
                <TextArea
                  value={b.building}
                  onChange={(e) => setBrief({ building: e.target.value })}
                  placeholder="Describe the software product or solution..."
                />
              </Field>

              <Field label="Who is it for?" hint="Be specific — a role, a situation, a segment.">
                <TextArea
                  value={b.audience}
                  onChange={(e) => setBrief({ audience: e.target.value })}
                  placeholder="e.g. Early-stage SaaS founders preparing to launch"
                />
              </Field>

              <Field label="What problem do they have?">
                <TextArea
                  value={b.problem}
                  onChange={(e) => setBrief({ problem: e.target.value })}
                  placeholder="What is painful or slow today?"
                />
              </Field>

              <Field label="What do they use today instead?">
                <TextArea
                  value={b.workaround}
                  onChange={(e) => setBrief({ workaround: e.target.value })}
                  placeholder="e.g. Manual spreadsheets, unstructured notes, generic AI chats"
                />
              </Field>

              <Field label="What outcome do they want?">
                <TextArea
                  value={b.outcome}
                  onChange={(e) => setBrief({ outcome: e.target.value })}
                  placeholder="What does success look like for them?"
                />
              </Field>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={handleSaveBrief} variant="primary">
                  {isBriefSaved ? "Save Changes" : "Save Venture Brief"}
                </Button>
                {isBriefSaved ? (
                  <Button variant="outline" onClick={() => setEditingBrief(false)}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          </Panel>
        ) : (
          <div className="space-y-6 fade-rise">
            {/* Polished Summary Card */}
            <Panel title="Venture Brief Summary">
              <dl className="grid gap-6 sm:grid-cols-2">
                <Item label="Target customer" value={targetCustomer(venture)} />
                <Item label="Problem statement" value={problemStatement(venture)} />
                <Item label="Current workaround" value={workaround(venture)} />
                <Item label="Value proposition" value={valueProp(venture)} />
              </dl>
            </Panel>

            {/* Riskiest Assumption Card */}
            <Panel title="Riskiest Assumption">
              <p className="font-display text-2xl leading-snug text-foreground font-semibold">
                “{riskiestAssumption(venture)}”
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                This is the core hypothesis to validate in Step 2 below before writing any code.
              </p>
            </Panel>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* STEP 2: CUSTOMER VALIDATION */}
      {/* ========================================================================= */}
      <section ref={step2Ref} className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-[#4F8CFF]/20 text-xs font-mono font-bold text-[#4F8CFF]">
              02
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">Step 2 — Customer Validation</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground font-medium">
            {interviewCount} of 5 customer interviews completed
          </span>
        </div>

        <Panel title="What you're testing">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">Target customer</p>
              <p className="mt-2 text-sm text-foreground font-medium">{targetCustomer(venture)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">Problem statement</p>
              <p className="mt-2 text-sm text-foreground font-medium">{problemStatement(venture)}</p>
            </div>
          </div>
          <p className="mt-6 border-l-2 border-[#4F8CFF] pl-4 font-display text-xl leading-snug text-foreground font-semibold">
            “{riskiestAssumption(venture)}”
          </p>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Outreach Message */}
          <Panel title="Suggested Outreach Message" action={<CopyButton text={outreachMessage} label="Copy message" />}>
            <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface/40 p-4 text-sm leading-relaxed text-foreground font-mono">
              {outreachMessage}
            </p>
          </Panel>

          {/* Interview Script */}
          <Panel title="Interview Script (5 Questions)" action={<CopyButton text={SCRIPT.join("\n")} label="Copy script" />}>
            <ul className="space-y-2.5 text-sm">
              {SCRIPT.map((q, idx) => (
                <li key={q} className="flex gap-2.5 border-b border-border/50 pb-2">
                  <span className="text-xs text-[#4F8CFF] font-mono font-bold">{idx + 1}.</span>
                  <span className="text-foreground">{q}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Seven-Day Validation Plan Accordion */}
        <Panel title="Seven-Day Validation Plan">
          <ol className="space-y-2">
            {PLAN.map((p, i) => (
              <li key={p} className="flex gap-3 border-b border-border/50 py-2 text-sm">
                <span className="text-xs tabular-nums font-mono text-[#4F8CFF] font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Log Interview Form */}
        <Panel title="Log Customer Interview">
          <form
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!interviewForm.name.trim()) return;

              update((v) => ({
                ...v,
                interviews: [
                  ...v.interviews,
                  { id: uid(), ...interviewForm, createdAt: new Date().toISOString() },
                ],
                traction: { ...v.traction, interviews: v.interviews.length + 1 },
              }));

              setInterviewForm({ name: "", role: "", quote: "", pain: "Medium", pay: "Maybe" });

              // Auto-unlock Step 3 & smooth scroll if first interview
              if (interviewCount === 0) {
                setTimeout(() => {
                  step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 200);
              }
            }}
          >
            <Field label="Person name">
              <TextInput
                value={interviewForm.name}
                onChange={(e) => setInterviewForm({ ...interviewForm, name: e.target.value })}
                placeholder="e.g. Sarah Connor"
                required
              />
            </Field>

            <Field label="Role / Company">
              <TextInput
                value={interviewForm.role}
                onChange={(e) => setInterviewForm({ ...interviewForm, role: e.target.value })}
                placeholder="e.g. Founder at Acme Corp"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Important quote or observation">
                <TextArea
                  value={interviewForm.quote}
                  onChange={(e) => setInterviewForm({ ...interviewForm, quote: e.target.value })}
                  placeholder="What did they explicitly say about pain, current tools, or willingness to pay?"
                />
              </Field>
            </div>

            <Choice
              label="Pain level"
              options={["Low", "Medium", "High"]}
              value={interviewForm.pain}
              onChange={(pain) => setInterviewForm({ ...interviewForm, pain: pain as PainLevel })}
            />

            <Choice
              label="Would they pay"
              options={["Yes", "Maybe", "No"]}
              value={interviewForm.pay}
              onChange={(pay) => setInterviewForm({ ...interviewForm, pay: pay as WouldPay })}
            />

            <div className="sm:col-span-2 pt-2">
              <Button type="submit" variant="primary">
                Save Logged Interview
              </Button>
            </div>
          </form>
        </Panel>

        {/* Saved Logged Interviews List */}
        <Panel title={`Saved Customer Interviews (${interviewCount})`}>
          {interviewCount === 0 ? (
            <Empty>
              No interviews logged yet. Save at least 1 interview above to automatically unlock Step 3 Insights.
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {venture.interviews.map((i) => (
                <article key={i.id} className="rounded-xl border border-border bg-surface/50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.role || "—"}</p>
                    </div>
                    <button
                      className="text-xs text-muted-foreground transition hover:text-destructive"
                      onClick={() =>
                        update((v) => ({
                          ...v,
                          interviews: v.interviews.filter((x) => x.id !== i.id),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                  {i.quote ? (
                    <p className="border-l-2 border-[#4F8CFF] pl-3 text-sm italic text-muted-foreground">
                      “{i.quote}”
                    </p>
                  ) : null}
                  <div className="flex gap-2 text-xs font-mono">
                    <span className="rounded-full border border-border px-2.5 py-1">Pain: {i.pain}</span>
                    <span className="rounded-full border border-border px-2.5 py-1">Pay: {i.pay}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>

      {/* ========================================================================= */}
      {/* STEP 3: VALIDATION INSIGHTS */}
      {/* ========================================================================= */}
      <section ref={step3Ref} className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-[#5AF2A2]/20 text-xs font-mono font-bold text-[#5AF2A2]">
              03
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">Step 3 — Validation Insights</h2>
          </div>
          {isStep3Unlocked && (
            <Button
              variant="primary"
              onClick={() => update((v) => ({ ...v, analyzed: true }))}
              className="flex items-center gap-1.5 text-xs"
            >
              <Sparkles className="size-3.5" /> Analyze Validation
            </Button>
          )}
        </div>

        {!isStep3Unlocked ? (
          <Panel title="Validation Insights Locked">
            <div className="py-8 text-center space-y-3">
              <Lock className="size-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Log at least 1 customer interview in Step 2 above to unlock automated validation analysis, decision signals, and evidence scoring.
              </p>
            </div>
          </Panel>
        ) : !venture.analyzed ? (
          <Panel title="Analysis Ready">
            <div className="py-8 text-center space-y-4">
              <Sparkles className="size-8 mx-auto text-[#4F8CFF] animate-pulse" />
              <div>
                <p className="text-base font-bold text-foreground">
                  {interviewCount} Customer Interview{interviewCount === 1 ? "" : "s"} Logged
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Click "Analyze Validation" to evaluate high-pain signals, willingness to pay, and recommendation signals based strictly on your saved interview evidence.
                </p>
              </div>
              <Button onClick={() => update((v) => ({ ...v, analyzed: true }))} variant="primary">
                Analyze Validation Insights
              </Button>
            </div>
          </Panel>
        ) : (
          <div className="space-y-6 fade-rise">
            {/* Stat Counters */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Total interviews completed" value={String(a.total)} />
              <Stat label="High-pain responses" value={String(a.high)} />
              <Stat label="Willing to pay" value={String(a.willPay)} />
            </div>

            {/* Decision Recommendation Card */}
            <Panel title="Decision Recommendation">
              <p className="font-display text-3xl font-bold text-[#5AF2A2] tracking-tight">{a.decision}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Based strictly on your {a.total} logged interview{a.total === 1 ? "" : "s"}: {a.high} high-pain, {a.low}{" "}
                low-pain, {a.willPay} willing to pay.
              </p>
            </Panel>

            {/* Quotes */}
            <Panel title="Most Important Customer Quotes">
              {a.quotes.length === 0 ? (
                <Empty>No quotes captured in your logged interviews yet.</Empty>
              ) : (
                <ul className="space-y-4">
                  {a.quotes.map((q) => (
                    <li key={q.id} className="border-l-2 border-[#4F8CFF] pl-4">
                      <p className="text-sm italic text-foreground">“{q.quote}”</p>
                      <p className="mt-1 text-xs text-muted-foreground font-mono">
                        {q.name} · {q.role || "role not recorded"} · pain {q.pain}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pain Points & Workarounds */}
              <Panel title="Repeated Pain Points & Workarounds">
                {repeatedWorkarounds.length === 0 ? (
                  <Empty>No repeated workarounds logged yet.</Empty>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {repeatedWorkarounds.map((w) => (
                      <li key={w} className="border-b border-border/50 py-2">
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-muted-foreground font-mono">
                  Stated workaround in brief: {venture.brief.workaround || "not recorded"}
                </p>
              </Panel>

              {/* Signals Matrix */}
              <Panel title="Signals Matrix">
                <p className="text-xs uppercase tracking-[0.18em] font-mono text-[#5AF2A2]">Positive Signals</p>
                {a.positives.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">None yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                    {a.positives.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-[#5AF2A2]" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-6 text-xs uppercase tracking-[0.18em] font-mono text-[#FF6B6B]">Warning Signs</p>
                {a.warnings.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">None.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {a.warnings.map((w) => (
                      <li key={w} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-[#FF6B6B]" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            {/* Editable Founder Notes */}
            <Panel
              title="Founder Notes"
              action={
                <span className="text-xs font-mono text-muted-foreground transition-all">
                  Status: <span className="font-semibold text-[#6AAEFF]">{saveNoteStatus}</span>
                </span>
              }
            >
              <Field label="What you concluded">
                <TextArea
                  rows={5}
                  value={venture.summaryNotes}
                  onChange={(e) => handleSaveNotes(e.target.value)}
                  placeholder="Patterns you noticed, people to follow up with, surprises from customer interviews..."
                />
              </Field>
            </Panel>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* FINAL ACTION: CONTINUE TO MVP SCOPE */}
      {/* ========================================================================= */}
      <div className="pt-8 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">
          {!canContinueToMvp
            ? "Complete Brief + Log at least 1 Interview + Analyze Insights to unlock MVP Scope"
            : "Validation complete! You are ready to scope your MVP."}
        </p>
        <LinkButton
          to="/workspace/mvp-scope"
          disabled={!canContinueToMvp}
          variant="primary"
          className="text-base px-6 py-3"
        >
          Continue to MVP Scope →
        </LinkButton>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-foreground font-medium">{value}</dd>
    </div>
  );
}

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-mono">{label}</span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={
              value === o
                ? "rounded-full bg-[#4F8CFF] px-4 py-2 text-xs font-semibold text-white shadow-sm"
                : "rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition hover:text-foreground hover:border-border/80"
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
