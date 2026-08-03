import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Empty, LinkButton, PageHeader, Panel, Progress, Stat, TextArea, TextInput } from "@/components/founderos/ui";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import { sprintStats } from "@/lib/founderos/derive";

const TITLE = "Launch Sprint — FounderOS";
const DESCRIPTION = "A seven-day launch sprint to get your first five users to try the product.";

export const Route = createFileRoute("/workspace/launch-sprint")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SprintPage,
});

function SprintPage() {
  const { venture, update } = useActiveVenture();
  const [draft, setDraft] = useState<Record<number, string>>({});
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const s = sprintStats(venture);

  const editDay = (day: number, patch: Partial<(typeof venture.sprint)[number]>) =>
    update((v) => ({ ...v, sprint: v.sprint.map((d) => (d.day === day ? { ...d, ...patch } : d)) }));

  return (
    <>
      <PageHeader
        eyebrow="Step 07"
        title="Launch Sprint"
        description="Success goal: get 5 early users to try the product."
        right={
          <div className="w-52">
            <Progress value={s.pct} label="Sprint progress" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Current day" value={`Day ${s.currentDay}`} />
        <Stat label="Tasks completed" value={String(s.done)} />
        <Stat label="Tasks remaining" value={String(s.remaining)} />
      </div>

      {s.complete ? (
        <Panel title="Sprint complete">
          <p className="font-display text-2xl">Every sprint task is done.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Record what actually happened — users, signups, revenue — in the traction dashboard.
          </p>
          <div className="mt-5">
            <LinkButton to="/workspace/traction" variant="primary">
              Go to Traction Dashboard
            </LinkButton>
          </div>
        </Panel>
      ) : null}

      <div className="relative space-y-6 border-l border-border pl-6">
        {venture.sprint.map((d) => (
          <div key={d.day} className="relative">
            <span className="absolute -left-[31px] top-6 size-2.5 rounded-full bg-[#4F8CFF] shadow-[0_0_12px_rgba(79,140,255,0.8)]" />
            <Panel title={`Day ${d.day}`}>
              <TextInput value={d.title} onChange={(e) => editDay(d.day, { title: e.target.value })} />
              <ul className="mt-4 space-y-2">
                {d.tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Complete ${t.title}`}
                      checked={t.done}
                      onChange={(e) =>
                        editDay(d.day, {
                          tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: e.target.checked } : x)),
                        })
                      }
                      className="size-4 accent-[#4F8CFF]"
                    />
                    <TextInput
                      value={t.title}
                      onChange={(e) =>
                        editDay(d.day, {
                          tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)),
                        })
                      }
                    />
                    <button
                      onClick={() => editDay(d.day, { tasks: d.tasks.filter((x) => x.id !== t.id) })}
                      className="text-xs text-muted-foreground transition hover:text-destructive"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = (draft[d.day] ?? "").trim();
                  if (!title) return;
                  editDay(d.day, { tasks: [...d.tasks, { id: uid(), title, done: false }] });
                  setDraft({ ...draft, [d.day]: "" });
                }}
              >
                <TextInput
                  value={draft[d.day] ?? ""}
                  placeholder="Add a task"
                  onChange={(e) => setDraft({ ...draft, [d.day]: e.target.value })}
                />
                <Button variant="subtle" type="submit">
                  Add task
                </Button>
              </form>
              <div className="mt-4">
                <TextArea
                  value={d.notes}
                  placeholder="Notes"
                  onChange={(e) => editDay(d.day, { notes: e.target.value })}
                />
              </div>
            </Panel>
          </div>
        ))}
      </div>

      <LinkButton to="/workspace/traction" variant="primary">
        Continue to Traction
      </LinkButton>
    </>
  );
}