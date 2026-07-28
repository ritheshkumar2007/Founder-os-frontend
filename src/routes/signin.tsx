import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Field, TextInput } from "@/components/founderos/ui";
import { signIn } from "@/lib/founderos/store";

const TITLE = "Sign in — FounderOS workspace";
const DESCRIPTION = "Sign in to your FounderOS workspace and continue building your venture.";

export const Route = createFileRoute("/signin")({
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
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <main className="hero-glow grain flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn({ name: name.trim() || "Founder", email: email.trim() });
          navigate({ to: "/workspace/venture-brief" });
        }}
        className="panel fade-rise w-full max-w-md rounded-2xl p-8"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-lime/80">FounderOS</p>
        <h1 className="mt-3 text-3xl">Enter your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your venture data is saved on this device and tied to your profile.
        </p>
        <div className="mt-8 space-y-5">
          <Field label="Your name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@venture.com"
            />
          </Field>
          <Button className="w-full" type="submit">
            Sign in
          </Button>
        </div>
      </form>
    </main>
  );
}