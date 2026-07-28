import { useRouterState } from "@tanstack/react-router";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import { analyzeValidation, riskiestAssumption, sprintStats } from "@/lib/founderos/derive";

const PAGE_LABELS: Record<string, string> = {
  "/workspace/venture-brief": "Venture Brief",
  "/workspace/validate": "Validate",
  "/workspace/validation-summary": "Validation Summary",
  "/workspace/mvp-scope": "MVP Scope",
  "/workspace/build-roadmap": "Build Roadmap",
  "/workspace/marketing-plan": "Marketing Plan",
  "/workspace/launch-sprint": "Launch Sprint",
  "/workspace/traction": "Traction",
  "/workspace/investor-update": "Investor Update",
};

const SUGGESTIONS: Record<string, string[]> = {
  "Venture Brief": ["Sharpen my problem statement", "Is my riskiest assumption testable?"],
  Validate: ["Write a warmer outreach message", "How do I find 5 people to interview?"],
  "Validation Summary": ["What do my interviews really say?", "Should I move to MVP?"],
  "MVP Scope": ["Which features should I cut?", "Is my MVP promise clear?"],
  "Build Roadmap": ["Break milestone one into tasks", "Am I scoping two weeks realistically?"],
  "Marketing Plan": ["Improve my landing headline", "Where do my customers hang out?"],
  "Launch Sprint": ["Plan day 3 outreach", "How do I get 5 users to try it?"],
  Traction: ["What should I focus on next?", "Are my conversion rates healthy?"],
  "Investor Update": ["Tighten my key learnings", "What milestone should I commit to?"],
};

export function ChatDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGE_LABELS[pathname] ?? "Workspace";
  const { venture, update } = useActiveVenture();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = venture?.chat ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, page]);

  function contextBlock() {
    if (!venture) return "";
    const a = analyzeValidation(venture);
    return [
      `Venture: ${venture.name}`,
      `Building: ${venture.brief.building || "(empty)"}`,
      `Audience: ${venture.brief.audience || "(empty)"}`,
      `Problem: ${venture.brief.problem || "(empty)"}`,
      `Workaround: ${venture.brief.workaround || "(empty)"}`,
      `Desired outcome: ${venture.brief.outcome || "(empty)"}`,
      `Riskiest assumption: ${riskiestAssumption(venture)}`,
      `Interviews logged: ${a.total} (high pain ${a.high}, would pay ${a.willPay})`,
      `MVP promise: ${venture.mvp.promise || "(empty)"}`,
      `Build now features: ${venture.mvp.buildNow.join(", ") || "(none)"}`,
      `Launch sprint progress: ${sprintStats(venture).pct}%`,
      `Traction: ${venture.traction.active} active users, ${venture.traction.paying} paying, ${venture.traction.revenue} monthly revenue`,
    ].join("\n");
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy || !venture) return;
    const userMsg = {
      id: uid(),
      role: "user" as const,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const history = [...messages, userMsg];
    update((v) => ({ ...v, chat: history }));
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          context: contextBlock(),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const reply = res.ok
        ? ((await res.json()) as { reply: string }).reply
        : "I couldn't reach the FounderOS assistant just now. Try again in a moment.";
      update((v) => ({
        ...v,
        chat: [
          ...v.chat,
          { id: uid(), role: "assistant", content: reply, createdAt: new Date().toISOString() },
        ],
      }));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="panel grain pointer-events-auto flex h-[28rem] w-[min(92vw,23rem)] flex-col overflow-hidden rounded-2xl fade-rise">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm text-foreground">FounderOS AI</p>
              <p className="text-xs text-muted-foreground">Helping with {page}</p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ask anything about {page}. I only reason about what you've saved for this venture.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(SUGGESTIONS[page] ?? []).map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-lime/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-2xl bg-lime px-3 py-2 text-lime-foreground"
                      : "text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy ? <p className="animate-pulse text-sm text-muted-foreground">Thinking…</p> : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-border p-3"
          >
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={`Ask about ${page}…`}
              className="w-full resize-none rounded-xl border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-lime/50"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="grid size-8 place-items-center rounded-full bg-lime text-lime-foreground transition hover:brightness-110 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-lime px-4 py-3 text-sm font-medium text-lime-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
      >
        <MessageSquare className="size-4" />
        {open ? "Hide" : "FounderOS AI"}
      </button>
    </div>
  );
}