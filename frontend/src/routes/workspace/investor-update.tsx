import { createFileRoute } from "@tanstack/react-router";
import { Button, CopyButton, Empty, Field, PageHeader, Panel, TextArea, TextInput } from "@/components/founderos/ui";
import { useActiveVenture } from "@/lib/founderos/store";
import { analyzeValidation, roadmapStats, sprintStats, tractionMetrics } from "@/lib/founderos/derive";

const TITLE = "Investor Update — FounderOS";
const DESCRIPTION = "Turn your saved venture data into a concise, professional founder update.";

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

const SECTIONS = [
  ["company", "Company name"],
  ["problem", "Problem"],
  ["solution", "Solution"],
  ["customer", "Target customer"],
  ["validation", "Validation evidence"],
  ["mvp", "MVP progress"],
  ["marketing", "Marketing and launch progress"],
  ["traction", "Traction numbers"],
  ["learnings", "Key learnings"],
  ["nextMilestone", "Next milestone"],
  ["ask", "Funding or support needed"],
] as const;

function InvestorPage() {
  const { venture, update } = useActiveVenture();
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const u = venture.investor;
  const a = analyzeValidation(venture);
  const r = roadmapStats(venture);
  const s = sprintStats(venture);
  const t = tractionMetrics(venture);

  const prefill = () =>
    update((v) => ({
      ...v,
      investor: {
        ...v.investor,
        company: v.name,
        problem: v.brief.problem,
        solution: v.brief.building,
        customer: v.brief.audience,
        validation: `${a.total} interviews logged · ${a.high} high pain · ${a.willPay} willing to pay · decision: ${a.decision}`,
        mvp: `${v.mvp.buildNow.length} must-have features in scope · roadmap ${r.pct}% complete (${r.done}/${r.total} tasks)`,
        marketing: `Channels: ${v.marketing.channels.filter(Boolean).join(", ") || "not set"} · launch sprint ${s.pct}% complete`,
        traction: `${v.traction.active} active users · ${v.traction.paying} paying · ${v.traction.revenue} monthly revenue · stage: ${t.stage}`,
      },
    }));

  const text = SECTIONS.map(([k, label]) => `${label}\n${u[k] || "—"}`).join("\n\n");

  return (
    <>
      <PageHeader
        eyebrow="Step 09"
        title="Investor Update"
        description="Every number comes from what you saved. Nothing is invented."
        right={<Button variant="outline" onClick={prefill}>Fill from saved data</Button>}
      />

      <Panel title="Editable sections">
        <div className="grid gap-5 sm:grid-cols-2">
          {SECTIONS.map(([key, label]) => (
            <Field key={key} label={label}>
              {key === "company" ? (
                <TextInput
                  value={u.company}
                  onChange={(e) => update((v) => ({ ...v, investor: { ...v.investor, company: e.target.value } }))}
                />
              ) : (
                <TextArea
                  value={u[key]}
                  onChange={(e) => update((v) => ({ ...v, investor: { ...v.investor, [key]: e.target.value } }))}
                />
              )}
            </Field>
          ))}
        </div>
      </Panel>

      <Panel title="Preview">
        <article className="space-y-5">
          <h2 className="font-display text-3xl">{u.company || venture.name} — founder update</h2>
          {SECTIONS.slice(1).map(([key, label]) => (
            <div key={key}>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{u[key] || "—"}</p>
            </div>
          ))}
        </article>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <CopyButton text={text} label="Copy Investor Update" />
        <Button
          variant="outline"
          onClick={() => download(`${venture.name}-investor-update.txt`, text)}
        >
          Download as text file
        </Button>
        <Button
          variant="outline"
          onClick={() => download(`${venture.name}-venture-summary.json`, JSON.stringify(venture, null, 2))}
        >
          Export Venture Summary
        </Button>
        <Button
          onClick={() =>
            update((v) => ({
              ...v,
              investor: {
                company: v.name,
                problem: "",
                solution: "",
                customer: "",
                validation: "",
                mvp: "",
                marketing: "",
                traction: "",
                learnings: "",
                nextMilestone: "",
                ask: "",
              },
            }))
          }
        >
          Start New Update
        </Button>
      </div>
    </>
  );
}

function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}