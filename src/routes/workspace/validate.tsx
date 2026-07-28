import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  CopyButton,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  Progress,
  TextArea,
  TextInput,
} from "@/components/founderos/ui";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import { problemStatement, riskiestAssumption, targetCustomer } from "@/lib/founderos/derive";
import type { PainLevel, WouldPay } from "@/lib/founderos/types";

const TITLE = "Validate — FounderOS";
const DESCRIPTION = "Run a seven-day validation plan and log real customer interviews.";

export const Route = createFileRoute("/workspace/validate")({
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
  component: Validate,
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

function Validate() {
  const { venture, update } = useActiveVenture();
  const [form, setForm] = useState({
    name: "",
    role: "",
    quote: "",
    pain: "Medium" as PainLevel,
    pay: "Maybe" as WouldPay,
  });

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const count = venture.interviews.length;
  const outreach = `Hi — I'm researching how ${targetCustomer(venture)} deal with ${problemStatement(venture)}. I'm not selling anything; I'd love 15 minutes to hear how you handle it today. Would this week work?`;

  return (
    <>
      <PageHeader
        eyebrow="Step 02"
        title="Validate"
        description="Talk to five people before you build anything. Evidence beats opinion."
        right={
          <div className="w-52">
            <Progress
              value={(Math.min(count, 5) / 5) * 100}
              label={`${count} of 5 customer interviews completed`}
            />
          </div>
        }
      />

      <Panel title="What you're testing">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target customer</p>
            <p className="mt-2 text-sm">{targetCustomer(venture)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Problem statement</p>
            <p className="mt-2 text-sm">{problemStatement(venture)}</p>
          </div>
        </div>
        <p className="mt-6 border-l border-lime/50 pl-4 font-display text-xl leading-snug">
          {riskiestAssumption(venture)}
        </p>
      </Panel>

      <Panel title="Seven-day validation plan">
        <ol className="space-y-2">
          {PLAN.map((p, i) => (
            <li key={p} className="flex gap-3 border-b border-border/50 py-2 text-sm">
              <span className="text-xs tabular-nums text-lime/70">{String(i + 1).padStart(2, "0")}</span>
              {p}
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Outreach message" action={<CopyButton text={outreach} label="Copy outreach message" />}>
        <p className="whitespace-pre-wrap rounded-xl border border-border bg-surface/40 p-4 text-sm leading-relaxed">
          {outreach}
        </p>
      </Panel>

      <Panel title="Interview script" action={<CopyButton text={SCRIPT.join("\n")} label="Copy script" />}>
        <ul className="space-y-2 text-sm">
          {SCRIPT.map((q) => (
            <li key={q} className="border-b border-border/50 py-2">
              {q}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Log interview">
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            update((v) => ({
              ...v,
              interviews: [
                ...v.interviews,
                { id: uid(), ...form, createdAt: new Date().toISOString() },
              ],
              traction: { ...v.traction, interviews: v.interviews.length + 1 },
            }));
            setForm({ name: "", role: "", quote: "", pain: "Medium", pay: "Maybe" });
          }}
        >
          <Field label="Person name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Role">
            <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Important quote or observation">
              <TextArea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
            </Field>
          </div>
          <Choice
            label="Pain level"
            options={["Low", "Medium", "High"]}
            value={form.pain}
            onChange={(pain) => setForm({ ...form, pain: pain as PainLevel })}
          />
          <Choice
            label="Would they pay"
            options={["Yes", "Maybe", "No"]}
            value={form.pay}
            onChange={(pay) => setForm({ ...form, pay: pay as WouldPay })}
          />
          <div className="sm:col-span-2">
            <Button type="submit">Log Interview</Button>
          </div>
        </form>
      </Panel>

      <Panel title={`Saved interviews (${count})`}>
        {count === 0 ? (
          <Empty>No interviews saved yet. Your summary will only ever use real logged interviews.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {venture.interviews.map((i) => (
              <article key={i.id} className="rounded-xl border border-border bg-surface/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-foreground">{i.name}</p>
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
                  <p className="mt-3 border-l border-lime/40 pl-3 text-sm italic text-muted-foreground">
                    “{i.quote}”
                  </p>
                ) : null}
                <div className="mt-4 flex gap-2 text-xs">
                  <span className="rounded-full border border-border px-2 py-1">Pain: {i.pain}</span>
                  <span className="rounded-full border border-border px-2 py-1">Pay: {i.pay}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {count > 0 ? (
        <LinkButton to="/workspace/validation-summary" variant="primary">
          Continue to Validation Summary
        </LinkButton>
      ) : null}
    </>
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
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={
              value === o
                ? "rounded-full bg-lime px-4 py-2 text-xs font-medium text-lime-foreground"
                : "rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition hover:text-foreground"
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}