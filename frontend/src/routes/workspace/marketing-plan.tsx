import { createFileRoute } from "@tanstack/react-router";
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
import { useActiveVenture } from "@/lib/founderos/store";
import { mvpPromise, problemStatement, targetCustomer } from "@/lib/founderos/derive";

const TITLE = "Marketing Plan — FounderOS";
const DESCRIPTION = "Positioning, channels and outreach templates to reach your first 100 users.";

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

function MarketingPage() {
  const { venture, update } = useActiveVenture();
  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;
  const p = venture.marketing;
  const set = (patch: Partial<typeof p>) =>
    update((v) => ({ ...v, marketing: { ...v.marketing, ...patch } }));

  const suggestedOutreach = `Hi — you mentioned dealing with ${problemStatement(venture)}. I built ${venture.name} to ${mvpPromise(venture).toLowerCase()} Want early access?`;

  return (
    <>
      <PageHeader
        eyebrow="Step 06"
        title="Marketing Plan"
        description="Written for the first hundred users, not a mass market."
      />

      <Panel title="Positioning">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ideal first customer">
            <TextArea
              value={p.idealCustomer}
              placeholder={targetCustomer(venture)}
              onChange={(e) => set({ idealCustomer: e.target.value })}
            />
          </Field>
          <Field label="Positioning statement">
            <TextArea value={p.positioning} onChange={(e) => set({ positioning: e.target.value })} />
          </Field>
          <Field label="Main marketing message">
            <TextArea value={p.message} onChange={(e) => set({ message: e.target.value })} />
          </Field>
          <Field label="Landing-page headline">
            <TextInput value={p.headline} onChange={(e) => set({ headline: e.target.value })} />
          </Field>
          <Field label="Main call-to-action">
            <TextInput value={p.cta} onChange={(e) => set({ cta: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton text={p.headline} label="Copy headline" />
          <CopyButton text={p.message} label="Copy message" />
        </div>
      </Panel>

      <Panel title="Three launch channels">
        <div className="grid gap-4 sm:grid-cols-3">
          {p.channels.map((c, i) => (
            <TextInput
              key={i}
              value={c}
              placeholder={`Channel ${i + 1}`}
              onChange={(e) =>
                set({ channels: p.channels.map((x, xi) => (xi === i ? e.target.value : x)) })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel
        title="Direct outreach message"
        action={<CopyButton text={p.outreach || suggestedOutreach} />}
      >
        <TextArea
          rows={4}
          value={p.outreach}
          placeholder={suggestedOutreach}
          onChange={(e) => set({ outreach: e.target.value })}
        />
      </Panel>

      <Panel title="Community post template" action={<CopyButton text={p.communityPost} />}>
        <TextArea
          rows={5}
          value={p.communityPost}
          placeholder={`I've been talking to ${targetCustomer(venture)} about ${problemStatement(venture)}. Here's what I learned and what I built…`}
          onChange={(e) => set({ communityPost: e.target.value })}
        />
      </Panel>

      <Panel title="Referral idea" action={<CopyButton text={p.referral} />}>
        <TextArea value={p.referral} onChange={(e) => set({ referral: e.target.value })} />
      </Panel>

      <Panel title="Three content ideas">
        <div className="space-y-3">
          {p.contentIdeas.map((c, i) => (
            <div key={i} className="flex gap-2">
              <TextInput
                value={c}
                placeholder={`Content idea ${i + 1}`}
                onChange={(e) =>
                  set({ contentIdeas: p.contentIdeas.map((x, xi) => (xi === i ? e.target.value : x)) })
                }
              />
              <CopyButton text={c} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="First 100 users strategy">
        <TextArea
          rows={5}
          value={p.firstHundred}
          placeholder="Where does your target customer already gather? Communities, newsletters, events, existing tools, referrals…"
          onChange={(e) => set({ firstHundred: e.target.value })}
        />
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => set({})}>Save Marketing Plan</Button>
        <LinkButton to="/workspace/launch-sprint" variant="primary">
          Continue to Launch Sprint
        </LinkButton>
      </div>
    </>
  );
}