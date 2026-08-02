import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/validation-summary")({
  beforeLoad: () => {
    throw redirect({ to: "/workspace/idea-validation" });
  },
});