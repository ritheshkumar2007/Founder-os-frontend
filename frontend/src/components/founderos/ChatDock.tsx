import { useRouterState } from "@tanstack/react-router";
import { MessageSquare, Send, X, Sparkles, Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import { api } from "@/lib/api";
import { analyzeValidation, riskiestAssumption, sprintStats } from "@/lib/founderos/derive";

const PAGE_LABELS: Record<string, string> = {
  "/workspace/venture-brief": "Idea Validation.app",
  "/workspace/validate": "Idea Validation.app",
  "/workspace/validation-summary": "Idea Validation.app",
  "/workspace/idea-validation": "Idea Validation.app",
  "/workspace/mvp-scope": "MVP Scope.app",
  "/workspace/build-roadmap": "Build Roadmap.app",
  "/workspace/marketing-plan": "Marketing Plan.app",
  "/workspace/launch-sprint": "Launch Sprint.app",
  "/workspace/traction": "Traction.app",
  "/workspace/investor-update": "Investor Update.app",
};

const SUGGESTIONS: Record<string, string[]> = {
  "Idea Validation.app": [
    "Sharpen my problem statement",
    "Is my riskiest assumption testable?",
    "Write a warmer outreach message",
    "How do I find 5 people to interview?",
    "What do my interviews really say?",
  ],
  "MVP Scope.app": ["Which features should I cut?", "Is my MVP promise clear?"],
  "Build Roadmap.app": ["Break milestone one into tasks", "Am I scoping two weeks realistically?"],
  "Marketing Plan.app": ["Improve my landing headline", "Where do my customers hang out?"],
  "Launch Sprint.app": ["Plan day 3 outreach", "How do I get 5 users to try it?"],
  "Traction.app": ["What should I focus on next?", "Are my conversion rates healthy?"],
  "Investor Update.app": ["Tighten my key learnings", "What milestone should I commit to?"],
};

export function ChatDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGE_LABELS[pathname] ?? "Workspace.app";
  const { app, venture, update } = useActiveVenture();
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
    const m = venture.marketing;
    const inv = venture.investor;
    return [
      `Authenticated Founder: ${app.user?.name || "Founder"} (${app.user?.email || "No email"})`,
      `Current Active Venture: ${venture.name} (ID: ${venture.id})`,
      `Current Workspace View: ${page} (${pathname})`,
      `Venture Brief:`,
      `  - Building: ${venture.brief?.building || "(empty)"}`,
      `  - Target Audience: ${venture.brief?.audience || "(empty)"}`,
      `  - Core Problem: ${venture.brief?.problem || "(empty)"}`,
      `  - Current Workaround: ${venture.brief?.workaround || "(empty)"}`,
      `  - Desired Outcome: ${venture.brief?.outcome || "(empty)"}`,
      `  - Saved Brief Status: ${venture.brief?.saved ? "Saved" : "Draft"}`,
      `Validation Data:`,
      `  - Riskiest Assumption: ${riskiestAssumption(venture)}`,
      `  - Total Interviews Logged: ${a.total} (High Pain: ${a.high}, Would Pay: ${a.willPay})`,
      `Build Progress:`,
      `  - MVP Core Problem: ${venture.mvp?.coreProblem || "(empty)"}`,
      `  - MVP Promise: ${venture.mvp?.promise || "(empty)"}`,
      `  - Build Now Features: ${(venture.mvp?.buildNow || []).join(", ") || "(none)"}`,
      `  - Launch Sprint Progress: ${sprintStats(venture).pct}% (${sprintStats(venture).done}/${sprintStats(venture).total} tasks completed)`,
      `Marketing Plan:`,
      `  - Ideal Customer: ${m?.idealCustomer || "(empty)"}`,
      `  - Channels: ${(m?.channels || []).filter(Boolean).join(", ") || "(none specified)"}`,
      `  - Headline: ${m?.headline || "(empty)"}`,
      `  - CTA: ${m?.cta || "(empty)"}`,
      `Traction Metrics:`,
      `  - Active Users: ${venture.traction?.active ?? 0}`,
      `  - Paying Customers: ${venture.traction?.paying ?? 0}`,
      `  - Monthly Revenue: $${venture.traction?.revenue ?? 0}`,
      `Investor Update:`,
      `  - Next Milestone: ${inv?.nextMilestone || "(empty)"}`,
      `  - Current Ask: ${inv?.ask || "(empty)"}`,
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
      const apiRes = await api.sendChatMessage({
        ventureId: venture.id,
        workspace: page,
        message: trimmed,
      });

      let reply = "";
      if (apiRes.success && (apiRes.data?.reply || apiRes.data?.message?.content)) {
        reply = apiRes.data.reply || apiRes.data.message.content;
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page,
            context: contextBlock(),
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        reply = res.ok
          ? ((await res.json()) as { reply: string }).reply
          : "I couldn't reach the FounderOS AI assistant just now. Try again in a moment.";
      }
      update((v) => ({
        ...v,
        chat: [
          ...v.chat,
          { id: uid(), role: "assistant", content: reply, createdAt: new Date().toISOString() },
        ],
      }));
    } catch {
      update((v) => ({
        ...v,
        chat: [
          ...v.chat,
          { id: uid(), role: "assistant", content: "Working in local mode.", createdAt: new Date().toISOString() },
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
        <div className="pointer-events-auto flex h-[30rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141C28]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] os-window-open">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0E131C]/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-[#64D8FF]/15 border border-[#64D8FF]/30 text-[#64D8FF]">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#F5F8FC] flex items-center gap-1.5">
                  FounderOS AI <Sparkles className="size-3 text-[#64D8FF]" />
                </p>
                <p className="text-[11px] font-mono text-[#A8B3C7]">Context: {page}</p>
              </div>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-[#A8B3C7] transition hover:bg-white/5 hover:text-[#F5F8FC]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[#A8B3C7] leading-relaxed">
                  Ask anything about <span className="text-[#F5F8FC] font-semibold">{page}</span>. I reason using your saved venture parameters.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(SUGGESTIONS[page] ?? SUGGESTIONS["Idea Validation.app"] ?? []).map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      className="rounded-lg border border-white/10 bg-[#161F2D]/80 px-2.5 py-1.5 text-xs text-[#A8B3C7] transition hover:border-[#64D8FF]/40 hover:text-[#F5F8FC] hover:bg-[#1A2433] text-left"
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
                    "max-w-[85%] whitespace-pre-wrap text-xs leading-relaxed transition-all",
                    m.role === "user"
                      ? "rounded-2xl bg-gradient-to-r from-[#4F8CFF] to-[#6EA8FF] px-3.5 py-2.5 text-[#F5F8FC] shadow-[0_4px_15px_rgba(79,140,255,0.3)]"
                      : "rounded-2xl border border-white/10 bg-[#161F2D] px-3.5 py-2.5 text-[#F5F8FC] shadow-sm",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[#64D8FF] animate-pulse">
                <Sparkles className="size-3.5" /> Reasoning…
              </div>
            ) : null}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-white/10 bg-[#0E131C]/60 p-3"
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
              placeholder={`Ask AI about ${page}…`}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#161F2D] px-3 py-2 text-xs text-[#F5F8FC] placeholder:text-[#74839B] outline-none transition focus:border-[#64D8FF]/60 focus:ring-1 focus:ring-[#64D8FF]/30"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="grid size-8 place-items-center rounded-xl bg-gradient-to-r from-[#64D8FF] to-[#4F8CFF] text-[#080A0F] font-bold transition hover:brightness-110 disabled:opacity-40 shadow-[0_0_12px_rgba(100,216,255,0.3)]"
              >
                <Send className="size-3.5 text-[#080A0F]" />
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#4F8CFF] to-[#6EA8FF] px-4 py-3 text-xs font-bold text-[#F5F8FC] shadow-[0_0_25px_rgba(79,140,255,0.35)] transition hover:brightness-110 hover:scale-[1.02] border border-white/20"
      >
        <Sparkles className="size-4 text-[#64D8FF]" />
        {open ? "Minimize AI" : "FounderOS AI Assistant"}
      </button>
    </div>
  );
}