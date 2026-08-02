import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ search }) => {
    const s = search as Record<string, unknown>;
    throw redirect({
      to: "/signin",
      search: {
        redirect: typeof s.redirect === "string" ? s.redirect : undefined,
        mode: "signup",
      },
    });
  },
});
