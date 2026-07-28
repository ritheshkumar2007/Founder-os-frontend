import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Empty, Field, LinkButton, PageHeader, Panel, Progress, TextArea, TextInput } from "@/components/founderos/ui";
import { useActiveVenture } from "@/lib/founderos/store";
import {
  problemStatement,
  riskiestAssumption,
  targetCustomer,
  valueProp,
  workaround,
} from "@/lib/founderos/derive";

const TITLE = "Venture Brief — FounderOS";
const DESCRIPTION = "Define what you're building, who it's for and the riskiest assumption behind it.";

export const Route = createFileRoute("/workspace/venture-brief")({
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
  component: VentureBrief,
});

function VentureBrief() {
  const { venture, update } = useActiveVenture();
  const [editing, setEditing] = useState(!venture?.brief.saved);

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const b = venture.brief;
  const fields = [b.building, b.audience, b.problem, b.workaround, b.outcome];
  const filled = fields.filter((f) => f.trim()).length;

  const set = (patch: Partial<typeof b>) =>
    update((v) => ({ ...v, brief: { ...v.brief, ...patch } }));

  return (
    <>
      <PageHeader
        eyebrow="Step 01"
        title="Venture Brief"
        description="Everything downstream in FounderOS is built from this brief. Keep it honest and specific."
        right={
          <div className="w-44">
            <Progress value={(filled / 5) * 100} label="Brief completeness" />
          </div>
        }
      />

      {editing ? (
        <Panel title="Guided brief">
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
                placeholder="Northwind"
              />
            </Field>
            <Field label="What are you building?">
              <TextArea value={b.building} onChange={(e) => set({ building: e.target.value })} />
            </Field>
            <Field label="Who is it for?" hint="Be specific — a role, a situation, a segment.">
              <TextArea value={b.audience} onChange={(e) => set({ audience: e.target.value })} />
            </Field>
            <Field label="What problem do they have?">
              <TextArea value={b.problem} onChange={(e) => set({ problem: e.target.value })} />
            </Field>
            <Field label="What do they use today instead?">
              <TextArea value={b.workaround} onChange={(e) => set({ workaround: e.target.value })} />
            </Field>
            <Field label="What outcome do they want?">
              <TextArea value={b.outcome} onChange={(e) => set({ outcome: e.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  set({ saved: true });
                  setEditing(false);
                }}
              >
                Save
              </Button>
              {b.saved ? (
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <Panel title="Brief summary">
            <dl className="grid gap-6 sm:grid-cols-2">
              <Item label="Target customer" value={targetCustomer(venture)} />
              <Item label="Problem statement" value={problemStatement(venture)} />
              <Item label="Current workaround" value={workaround(venture)} />
              <Item label="Value proposition" value={valueProp(venture)} />
            </dl>
          </Panel>

          <Panel title="Riskiest assumption">
            <p className="font-display text-2xl leading-snug text-foreground">
              {riskiestAssumption(venture)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              This is the single belief that, if wrong, makes everything else irrelevant. Test it next.
            </p>
          </Panel>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Venture Brief
            </Button>
            <Button onClick={() => set({ saved: true })}>Save</Button>
            <LinkButton to="/workspace/validate" variant="primary">
              Continue to Validate
            </LinkButton>
          </div>
        </>
      )}
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}