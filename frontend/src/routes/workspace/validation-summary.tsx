import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Empty,
  Field,
  LinkButton,
  PageHeader,
  Panel,
  Stat,
  TextArea,
} from "@/components/founderos/ui";
import { useActiveVenture } from "@/lib/founderos/store";
import { analyzeValidation } from "@/lib/founderos/derive";

const TITLE = "Validation Summary — FounderOS";
const DESCRIPTION = "Analyze your logged customer interviews and decide the next move.";

export const Route = createFileRoute("/workspace/validation-summary")({
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
  component: ValidationSummary,
});

function ValidationSummary() {
  const { venture, update } = useActiveVenture();
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const a = analyzeValidation(venture);
  const workarounds = Array.from(
    new Set(venture.interviews.map((i) => i.quote).filter(Boolean)),
  ).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Step 03"
        title="Validation Summary"
        description="Only your saved interviews are analyzed here — nothing is invented."
        right={
          <Button onClick={() => update((v) => ({ ...v, analyzed: true }))}>Analyze Validation</Button>
        }
      />

      {!venture.analyzed ? (
        <Empty>Run “Analyze Validation” to summarize the {a.total} interview(s) you've logged.</Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Interviews completed" value={String(a.total)} />
            <Stat label="High-pain responses" value={String(a.high)} />
            <Stat label="Willing to pay" value={String(a.willPay)} />
          </div>

          <Panel title="Decision">
            <p className="font-display text-3xl text-lime">{a.decision}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Based on {a.total} interview{a.total === 1 ? "" : "s"}: {a.high} high-pain, {a.low}{" "}
              low-pain, {a.willPay} willing to pay.
            </p>
          </Panel>

          <Panel title="Most important customer quotes">
            {a.quotes.length === 0 ? (
              <Empty>No quotes captured in your logged interviews yet.</Empty>
            ) : (
              <ul className="space-y-4">
                {a.quotes.map((q) => (
                  <li key={q.id} className="border-l border-lime/40 pl-4">
                    <p className="text-sm italic">“{q.quote}”</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {q.name} · {q.role || "role not recorded"} · pain {q.pain}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Repeated pain points & workarounds">
              {workarounds.length === 0 ? (
                <Empty>Nothing recorded yet.</Empty>
              ) : (
                <ul className="space-y-2 text-sm">
                  {workarounds.map((w) => (
                    <li key={w} className="border-b border-border/50 py-2">
                      {w}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                Stated workaround in your brief: {venture.brief.workaround || "not recorded"}
              </p>
            </Panel>
            <Panel title="Signals">
              <p className="text-xs uppercase tracking-[0.18em] text-lime/80">Positive signals</p>
              {a.positives.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">None yet.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {a.positives.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-destructive/80">Warning signs</p>
              {a.warnings.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">None.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {a.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}

      <Panel title="Founder notes">
        <Field label="What you concluded">
          <TextArea
            rows={5}
            value={venture.summaryNotes}
            onChange={(e) => update((v) => ({ ...v, summaryNotes: e.target.value }))}
            placeholder="Patterns you noticed, people to follow up with, what surprised you…"
          />
        </Field>
      </Panel>

      <LinkButton to="/workspace/mvp-scope" variant="primary">
        Create MVP Scope
      </LinkButton>
    </>
  );
}