import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { useActiveVenture } from "@/lib/founderos/store";
import { analyzeValidation, mvpPromise, problemStatement } from "@/lib/founderos/derive";

const TITLE = "MVP Scope — FounderOS";
const DESCRIPTION = "Scope the smallest usable MVP and decide what to deliberately exclude.";

export const Route = createFileRoute("/workspace/mvp-scope")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MvpScopePage,
});

function MvpScopePage() {
  const { venture, update } = useActiveVenture();
  const [now, setNow] = useState("");
  const [later, setLater] = useState("");
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  const m = venture.mvp;
  const a = analyzeValidation(venture);
  const set = (patch: Partial<typeof m>) => update((v) => ({ ...v, mvp: { ...v.mvp, ...patch } }));
  const tooMany = m.buildNow.length > 5;

  return (
    <>
      <PageHeader
        eyebrow="Step 04"
        title="MVP Scope"
        description={`Built from your brief and ${a.total} logged interview${a.total === 1 ? "" : "s"}. Three to five features, nothing more.`}
      />

      <Panel title="The core">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Core customer problem">
            <TextArea
              value={m.coreProblem}
              placeholder={problemStatement(venture)}
              onChange={(e) => set({ coreProblem: e.target.value })}
            />
          </Field>
          <Field label="Main job to be done">
            <TextArea value={m.job} onChange={(e) => set({ job: e.target.value })} />
          </Field>
          <Field label="MVP promise" hint="Help [customer] achieve [outcome] without [workaround].">
            <TextArea
              value={m.promise}
              placeholder={mvpPromise(venture)}
              onChange={(e) => set({ promise: e.target.value })}
            />
          </Field>
          <Field label="Desired user outcome">
            <TextArea value={m.outcome} onChange={(e) => set({ outcome: e.target.value })} />
          </Field>
          <Field label="Two-week build target">
            <TextInput value={m.target} onChange={(e) => set({ target: e.target.value })} />
          </Field>
        </div>
        {!m.promise ? (
          <p className="mt-5 border-l border-[#4F8CFF]/50 pl-4 text-sm text-muted-foreground">
            Suggested promise: {mvpPromise(venture)}
          </p>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Build now (3–5 must-haves)">
          <List
            items={m.buildNow}
            onRemove={(i) => set({ buildNow: m.buildNow.filter((_, x) => x !== i) })}
          />
          <AddRow
            value={now}
            onChange={setNow}
            onAdd={() => {
              if (!now.trim()) return;
              set({ buildNow: [...m.buildNow, now.trim()] });
              setNow("");
            }}
          />
          {tooMany ? (
            <p className="mt-3 text-xs text-destructive">
              That's {m.buildNow.length} features. Move the weakest ones to Later.
            </p>
          ) : null}
        </Panel>
        <Panel title="Later (deliberately excluded)">
          <List items={m.later} onRemove={(i) => set({ later: m.later.filter((_, x) => x !== i) })} />
          <AddRow
            value={later}
            onChange={setLater}
            onAdd={() => {
              if (!later.trim()) return;
              set({ later: [...m.later, later.trim()] });
              setLater("");
            }}
          />
        </Panel>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => set({})}>Save MVP Scope</Button>
        <LinkButton to="/workspace/build-roadmap" variant="primary">
          Continue to Build Roadmap
        </LinkButton>
      </div>
    </>
  );
}

function List({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  if (items.length === 0) return <Empty>Nothing here yet.</Empty>;
  return (
    <ul className="space-y-2">
      {items.map((f, i) => (
        <li
          key={`${f}-${i}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm"
        >
          {f}
          <button
            onClick={() => onRemove(i)}
            className="text-xs text-muted-foreground transition hover:text-destructive"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddRow({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd();
      }}
    >
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="Add a feature" />
      <Button variant="subtle" type="submit">
        Add
      </Button>
    </form>
  );
}