import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/venture-brief")({
  beforeLoad: () => {
    throw redirect({ to: "/workspace/idea-validation" });
  },
});