import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Empty,
  LinkButton,
  PageHeader,
  Panel,
  Progress,
  Stat,
  TextInput,
} from "@/components/founderos/ui";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import { roadmapStats } from "@/lib/founderos/derive";
import type { Task, TaskStatus } from "@/lib/founderos/types";

const TITLE = "Build Roadmap — FounderOS";
const DESCRIPTION = "A two-week roadmap with three milestones, owners, due dates and progress.";

export const Route = createFileRoute("/workspace/build-roadmap")({
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
  component: RoadmapPage,
});

const STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Done"];

function RoadmapPage() {
  const { venture, update } = useActiveVenture();
  const [draft, setDraft] = useState<Record<string, string>>({});
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const stats = roadmapStats(venture);

  const editMilestone = (id: string, fn: (tasks: Task[]) => Task[]) =>
    update((v) => ({
      ...v,
      milestones: v.milestones.map((m) => (m.id === id ? { ...m, tasks: fn(m.tasks) } : m)),
    }));

  return (
    <>
      <PageHeader
        eyebrow="Step 05"
        title="Build Roadmap"
        description={`Two weeks to a testable MVP: ${venture.mvp.buildNow.length || "no"} must-have feature(s) in scope.`}
        right={
          <div className="w-52">
            <Progress value={stats.pct} label="Overall completion" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Completed tasks" value={String(stats.done)} />
        <Stat label="Remaining tasks" value={String(stats.remaining)} />
        <Stat label="Current milestone" value={stats.current || "—"} />
      </div>

      <div className="relative space-y-6 border-l border-border pl-6">
        {venture.milestones.map((m, idx) => {
          const done = m.tasks.filter((t) => t.done).length;
          return (
            <div key={m.id} className="relative">
              <span className="absolute -left-[31px] top-6 size-2.5 rounded-full bg-[#4F8CFF] shadow-[0_0_12px_rgba(79,140,255,0.8)]" />
              <Panel
                title={`Milestone ${idx + 1}`}
                action={
                  <span className="text-xs text-muted-foreground">
                    {done}/{m.tasks.length} done
                  </span>
                }
              >
                <h3 className="font-display text-2xl">{m.title}</h3>
                <div className="mt-4">
                  <Progress value={m.tasks.length ? (done / m.tasks.length) * 100 : 0} />
                </div>

                <ul className="mt-5 space-y-3">
                  {m.tasks.map((t) => (
                    <li
                      key={t.id}
                      className="grid gap-3 rounded-xl border border-border bg-surface/50 p-3 sm:grid-cols-[auto_1fr_9rem_9rem_8rem_auto] sm:items-center"
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        aria-label={`Complete ${t.title}`}
                        onChange={(e) =>
                          editMilestone(m.id, (tasks) =>
                            tasks.map((x) =>
                              x.id === t.id
                                ? {
                                    ...x,
                                    done: e.target.checked,
                                    status: e.target.checked ? "Done" : "In Progress",
                                  }
                                : x,
                            ),
                          )
                        }
                        className="size-4 accent-[#4F8CFF]"
                      />
                      <TextInput
                        value={t.title}
                        onChange={(e) =>
                          editMilestone(m.id, (tasks) =>
                            tasks.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)),
                          )
                        }
                      />
                      <TextInput
                        value={t.owner}
                        placeholder="Owner"
                        onChange={(e) =>
                          editMilestone(m.id, (tasks) =>
                            tasks.map((x) => (x.id === t.id ? { ...x, owner: e.target.value } : x)),
                          )
                        }
                      />
                      <select
                        value={t.status}
                        aria-label="Task status"
                        onChange={(e) =>
                          editMilestone(m.id, (tasks) =>
                            tasks.map((x) =>
                              x.id === t.id
                                ? {
                                    ...x,
                                    status: e.target.value as TaskStatus,
                                    done: e.target.value === "Done",
                                  }
                                : x,
                            ),
                          )
                        }
                        className="rounded-xl border border-input bg-background/60 px-3 py-3 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <TextInput
                        type="date"
                        value={t.due}
                        onChange={(e) =>
                          editMilestone(m.id, (tasks) =>
                            tasks.map((x) => (x.id === t.id ? { ...x, due: e.target.value } : x)),
                          )
                        }
                      />
                      <button
                        onClick={() => editMilestone(m.id, (tasks) => tasks.filter((x) => x.id !== t.id))}
                        className="text-xs text-muted-foreground transition hover:text-destructive"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const title = (draft[m.id] ?? "").trim();
                    if (!title) return;
                    editMilestone(m.id, (tasks) => [
                      ...tasks,
                      { id: uid(), title, owner: "", status: "Not Started", due: "", done: false },
                    ]);
                    setDraft({ ...draft, [m.id]: "" });
                  }}
                >
                  <TextInput
                    value={draft[m.id] ?? ""}
                    placeholder="Add a task"
                    onChange={(e) => setDraft({ ...draft, [m.id]: e.target.value })}
                  />
                  <Button variant="subtle" type="submit">
                    Add task
                  </Button>
                </form>
              </Panel>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Roadmap</Button>
        <LinkButton to="/workspace/marketing-plan" variant="primary">
          Continue to Marketing Plan
        </LinkButton>
      </div>
    </>
  );
}