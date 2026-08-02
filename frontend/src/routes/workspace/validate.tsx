import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/validate")({
  beforeLoad: () => {
    throw redirect({ to: "/workspace/idea-validation" });
  },
});