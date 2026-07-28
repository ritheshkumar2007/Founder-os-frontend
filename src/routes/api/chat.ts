import { createFileRoute } from "@tanstack/react-router";

interface Body {
  messages?: { role: "user" | "assistant"; content: string }[];
  page?: string;
  context?: string;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
        if (messages.length === 0) return new Response("Messages are required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI is not configured", { status: 500 });

        const system = [
          "You are the FounderOS AI copilot inside a founder workspace.",
          "Be concise, practical and specific. Max 120 words unless asked for more.",
          "Never invent customer evidence, quotes, traction or revenue — only reason about what the founder saved.",
          `The founder is currently on the "${body.page ?? "workspace"}" page.`,
          body.context ? `Saved venture context:\n${body.context}` : "No venture data saved yet.",
        ].join("\n");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.6-sol",
            reasoning_effort: "none",
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          return new Response(text || "AI request failed", { status: res.status });
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        return Response.json({
          reply: data.choices?.[0]?.message?.content ?? "I couldn't generate a response.",
        });
      },
    },
  },
});