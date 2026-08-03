import { createFileRoute } from "@tanstack/react-router";
import { ChatPage } from "@/components/founderos/chat/ChatPage";

const TITLE = "FounderOS AI Founder Coach — Venture Brief Workspace";
const DESCRIPTION =
  "Talk naturally with your FounderOS AI Coach to build your venture brief, validate customer pain, and scope your startup.";

export const Route = createFileRoute("/workspace/idea-validation")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IdeaValidationWorkspace,
});

function IdeaValidationWorkspace() {
  return <ChatPage />;
}
