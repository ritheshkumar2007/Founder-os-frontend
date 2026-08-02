import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Empty, Field, LinkButton, PageHeader, Panel, Stat, TextInput } from "@/components/founderos/ui";
import { useActiveVenture } from "@/lib/founderos/store";
import { tractionMetrics } from "@/lib/founderos/derive";

const TITLE = "Traction — FounderOS";
const DESCRIPTION = "Track contacted people, users, paying customers and revenue over time.";

export const Route = createFileRoute("/workspace/traction")({
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
  component: TractionPage,
});

const FIELDS = [
  ["contacted", "People contacted"],
  ["interviews", "Customer interviews"],
  ["waitlist", "Waitlist signups"],
  ["tried", "Users who tried the MVP"],
  ["active", "Active users"],
  ["paying", "Paying users"],
  ["revenue", "Monthly revenue"],
] as const;

function TractionPage() {
  const { venture, update } = useActiveVenture();
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const t = venture.traction;
  const m = tractionMetrics(venture);

  return (
    <>
      <PageHeader
        eyebrow="Step 08"
        title="Traction"
        description="Only your own saved numbers are shown — nothing is simulated."
      />

      <Panel title="Your numbers">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <TextInput
                type="number"
                min={0}
                value={String(t[key])}
                onChange={(e) =>
                  update((v) => ({
                    ...v,
                    traction: { ...v.traction, [key]: Number(e.target.value) || 0 },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Contacted → user" value={`${m.contactToUser.toFixed(1)}%`} />
        <Stat label="User → paying" value={`${m.userToPaying.toFixed(1)}%`} />
        <Stat label="Monthly revenue" value={t.revenue.toLocaleString()} />
        <Stat label="Revenue per paying user" value={m.arpu.toFixed(2)} />
        <Stat label="Traction stage" value={m.stage} />
        <Stat label="Next action" value={m.nextAction} />
      </div>

      <Panel title="Growth over time" action={
        <Button
          variant="subtle"
          onClick={() =>
            update((v) => ({
              ...v,
              traction: {
                ...v.traction,
                history: [
                  ...v.traction.history,
                  {
                    date: new Date().toISOString().slice(0, 10),
                    active: v.traction.active,
                    waitlist: v.traction.waitlist,
                    revenue: v.traction.revenue,
                  },
                ],
              },
            }))
          }
        >
          Snapshot today
        </Button>
      }>
        {t.history.length === 0 ? (
          <Empty>Save a snapshot to start charting your growth. No sample data is shown.</Empty>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={t.history}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-foreground)",
                  }}
                />
                <Area type="monotone" dataKey="active" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.15} />
                <Area type="monotone" dataKey="waitlist" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.12} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="Recommended next action">
        <p className="font-display text-2xl text-[#4F8CFF] font-semibold">{m.nextAction}</p>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => update((v) => ({ ...v }))}>Save Traction</Button>
        <LinkButton to="/workspace/investor-update" variant="primary">
          Continue to Investor Update
        </LinkButton>
      </div>
    </>
  );
}