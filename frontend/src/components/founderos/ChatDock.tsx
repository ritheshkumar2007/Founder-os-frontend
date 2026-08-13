import { useRouterState } from "@tanstack/react-router";
import { MessageSquare, Send, X, Sparkles, Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import { api } from "@/lib/api";
import { analyzeValidation, riskiestAssumption, sprintStats } from "@/lib/founderos/derive";
import { generateMockAiResponse } from "./chat/mockAiEngine";

const PAGE_LABELS: Record<string, string> = {
  "/workspace/venture-brief": "Idea Validation",
  "/workspace/validate": "Idea Validation",
  "/workspace/validation-summary": "Idea Validation",
  "/workspace/idea-validation": "Idea Validation",
  "/workspace/mvp-scope": "MVP Scope",
  "/workspace/build-roadmap": "Build Roadmap",
  "/workspace/marketing-plan": "Marketing Plan",
  "/workspace/launch-sprint": "Launch Sprint",
  "/workspace/traction": "Traction",
  "/workspace/investor-update": "Investor Update",
};

const SUGGESTIONS: Record<string, string[]> = {
  "Idea Validation": [
    "Sharpen my problem statement",
    "Is my riskiest assumption testable?",
    "Write a warmer outreach message",
    "How do I find 5 people to interview?",
    "What do my interviews really say?",
  ],
  "MVP Scope": ["Which features should I cut?", "Is my MVP promise clear?"],
  "Build Roadmap": ["Break milestone one into tasks", "Am I scoping two weeks realistically?"],
  "Marketing Plan": ["Improve my landing headline", "Where do my customers hang out?"],
  "Launch Sprint": ["Plan day 3 outreach", "How do I get 5 users to try it?"],
  "Traction": ["What should I focus on next?", "Are my conversion rates healthy?"],
  "Investor Update": ["Tighten my key learnings", "What milestone should I commit to?"],
};

export function ChatDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const page = PAGE_LABELS[pathname] ?? "Workspace";
  const { app, venture, update } = useActiveVenture();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = venture?.chat ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!venture) return null;

  const suggestions = SUGGESTIONS[page] ?? [
    "What should I do next?",
    "Summarize where my venture stands.",
  ];

  async function handleSend(text?: string) {
    const messageText = (text ?? input).trim();
    if (!messageText || busy || !venture) return;

    setInput("");
    const userMsgId = uid();
    const assistantMsgId = uid();

    // 1. Add User message to local store
    update((v) => ({
      ...v,
      chat: [
        ...v.chat,
        { id: userMsgId, role: "user", content: messageText, createdAt: new Date().toISOString() },
      ],
    }));

    setBusy(true);

    try {
      // 2. Call backend 4-Layer processAIRequest API
      const res = await api.aiChat({
        ventureId: venture.id,
        message: messageText,
        history: venture.chat.map((m) => ({ role: m.role, content: m.content })),
      });

      const replyContent =
        res.success && res.data?.reply
          ? res.data.reply
          : `Processed: "${messageText}". Let's refine your venture parameters.`;

      // 3. Append Assistant response to local store
      update((v) => ({
        ...v,
        chat: [
          ...v.chat,
          {
            id: assistantMsgId,
            role: "assistant",
            content: replyContent,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } catch (err) {
      console.warn("AI Chat Dock request failed, using local contextual fallback:", err);
      const fallbackReply = generateMockAiResponse(messageText, v.chat, v);
      update((v) => ({
        ...v,
        chat: [
          ...v.chat,
          {
            id: assistantMsgId,
            role: "assistant",
            content: fallbackReply,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-[rgba(139,92,246,0.4)] bg-[#0b0f12] px-5 py-3 text-xs font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-all hover:scale-105 hover:border-[#A78BFA] active:scale-95 cursor-pointer"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A78BFA] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#8B5CF6]" />
          </span>
          <Sparkles className="size-4 text-[#A78BFA]" />
          <span>FounderOS AI Co-Pilot</span>
        </button>
      )}

      {/* Slide-over Dock Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[620px] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-2xl os-window-open">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.25)] bg-[#101417] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-xl border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.15)] text-[#A78BFA]">
                <Bot className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">FounderOS AI Assistant</h3>
                  <span className="rounded-full bg-[rgba(139,92,246,0.15)] px-2 py-0.5 font-mono text-[9px] font-bold text-[#A78BFA] border border-[rgba(139,92,246,0.3)]">
                    Active Context
                  </span>
                </div>
                <p className="text-[11px] text-[#cbc3d7] font-mono">{page}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-[#958ea0] transition hover:bg-white/5 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="grid size-12 place-items-center rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.15)] text-[#A78BFA]">
                  <Sparkles className="size-6 text-[#A78BFA]" />
                </div>
                <h4 className="text-sm font-bold text-white">AI Co-Founder Connected</h4>
                <p className="text-xs text-[#cbc3d7] max-w-[260px]">
                  Ask questions about <span className="text-[#A78BFA] font-semibold">{page}</span> or request strategic startup advice.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-[#A78BFA] text-black font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        : "bg-[#101417] text-white border border-white/5",
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="text-[9px] font-mono text-[#958ea0] px-1">
                    {m.role === "user" ? "You" : "FounderOS AI"}
                  </span>
                </div>
              ))
            )}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-[#A78BFA] font-mono bg-[rgba(139,92,246,0.1)] px-3.5 py-2.5 rounded-xl border border-[rgba(139,92,246,0.3)] w-fit">
                <Sparkles className="size-3.5 animate-spin text-[#A78BFA]" />
                <span>AI Co-Pilot is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="border-t border-white/5 bg-[#101417]/50 p-2.5 overflow-x-auto no-scrollbar flex gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => void handleSend(s)}
                disabled={busy}
                className="shrink-0 rounded-lg border border-white/10 bg-[#101417] px-2.5 py-1 text-[11px] font-medium text-[#cbc3d7] transition hover:border-[rgba(139,92,246,0.4)] hover:text-white hover:bg-[rgba(139,92,246,0.15)] disabled:opacity-50 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="border-t border-[rgba(139,92,246,0.25)] bg-[#101417] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-2 focus-within:border-[#A78BFA]"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder={`Ask AI Co-Pilot about ${page}...`}
                className="flex-1 resize-none bg-transparent px-2 text-xs text-white placeholder-[#958ea0] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="grid size-8 place-items-center rounded-lg bg-[#A78BFA] hover:bg-[#bfa8ff] text-black transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}