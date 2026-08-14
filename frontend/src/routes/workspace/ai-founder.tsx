import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  Empty,
  PageHeader,
  Panel,
  TextArea,
} from "@/components/founderos/ui";
import { Sparkles, Send, Bot, User, RefreshCw, Layers, CheckCircle2, ShieldAlert, Rocket, LineChart, DollarSign, ArrowRight, HelpCircle } from "lucide-react";
import { useActiveVenture } from "@/lib/founderos/store";
import api from "@/lib/api";

const TITLE = "AI Co-Founder — FounderOS";
const DESCRIPTION = "Your strategic AI Co-Founder with real-time context across all 7 startup workspaces.";

export const Route = createFileRoute("/workspace/ai-founder")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AIFounderPage,
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

function AIFounderPage() {
  const { venture } = useActiveVenture();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [contextData, setContextData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_QUESTIONS = [
    "Should I change my MVP scope?",
    "How can I get my first 100 paying users?",
    "Is my startup ready for investors?",
    "What should I build next?",
    "Analyze my growth problems and churn.",
  ];

  useEffect(() => {
    if (venture?.id) {
      loadHistory();
    }
  }, [venture?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function loadHistory() {
    if (!venture?.id) return;
    setLoadingHistory(true);
    try {
      const res = await api.getFounderAIHistoryModule(venture.id);
      if (res.success) {
        if (res.data?.conversation?.messages) {
          setMessages(res.data.conversation.messages);
        }
        if (res.data?.context) {
          setContextData(res.data.context);
        }
      }
    } catch (err) {
      console.warn("Failed to load AI Co-Founder history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSendMessage(customPrompt?: string) {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || sending || !venture?.id) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage("");
    setSending(true);

    try {
      const res = await api.chatWithFounderAIModule({
        ventureId: venture.id,
        message: textToSend.trim(),
      });

      if (res.success && res.data?.reply) {
        const assistantMsg: ChatMessage = { role: "assistant", content: res.data.reply };
        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.context) {
          setContextData(res.data.context);
        }
      }
    } catch (err) {
      console.warn("Failed to send message to AI Co-Founder:", err);
    } finally {
      setSending(false);
    }
  }

  if (!venture) return <Empty>Create a venture from the sidebar to begin.</Empty>;

  return (
    <>
      <PageHeader
        eyebrow="Central Command"
        title="FounderOS AI Co-Founder"
        description="Strategic AI partner holding real-time memory across your Validation, MVP Scope, Roadmap, Marketing, Launch, Traction, and Investor updates."
        right={
          <button
            onClick={() => loadHistory()}
            disabled={loadingHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#101417] px-3 py-1.5 text-xs text-[#cbc3d7] hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`size-3.5 text-[#A78BFA] ${loadingHistory ? "animate-spin" : ""}`} />
            Sync Context
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Area (2 Columns) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[520px] sm:h-[620px] lg:h-[750px]">
          {/* Component 3: Suggested Questions */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-mono text-[#A78BFA] flex items-center gap-1">
              <HelpCircle className="size-3.5" /> Prompts:
            </span>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => void handleSendMessage(q)}
                disabled={sending}
                className="text-[11px] text-[#cbc3d7] bg-[#101417] hover:bg-[rgba(139,92,246,0.15)] hover:text-[#A78BFA] hover:border-[rgba(139,92,246,0.4)] px-2.5 sm:px-3 py-1 rounded-xl border border-white/5 transition text-left disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Component 1: AI Chat Window */}
          <div className="flex-1 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] p-3.5 sm:p-4 overflow-y-auto space-y-3.5 sm:space-y-4 shadow-2xl">
            {messages.length === 0 && !loadingHistory && (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center space-y-3">
                <Bot className="size-10 text-[#A78BFA]" />
                <h3 className="text-sm font-bold text-white">I am your FounderOS AI Co-Founder</h3>
                <p className="text-xs text-[#cbc3d7] max-w-md">
                  I have analyzed your 7 active startup workspaces. Ask me strategic questions about your MVP, marketing strategy, user retention, or investor readiness.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 sm:gap-3 text-xs ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="size-7 sm:size-8 rounded-xl bg-[#A78BFA] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.4)]">
                    <Bot className="size-3.5 sm:size-4 text-black" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 sm:p-4 whitespace-pre-wrap leading-relaxed shadow-sm break-words overflow-hidden ${
                    msg.role === "user"
                      ? "bg-[#A78BFA] text-black font-semibold"
                      : "bg-[#101417] border border-white/5 text-white"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="size-7 sm:size-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <User className="size-3.5 sm:size-4" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Thinking Animation */}
            {sending && (
              <div className="flex gap-2.5 sm:gap-3 text-xs justify-start">
                <div className="size-7 sm:size-8 rounded-xl bg-[#A78BFA] flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="size-3.5 sm:size-4 text-black" />
                </div>
                <div className="bg-[#101417] border border-[rgba(139,92,246,0.3)] p-3.5 sm:p-4 rounded-2xl text-[#A78BFA] flex items-center gap-2 shadow-lg">
                  <RefreshCw className="size-4 animate-spin text-[#A78BFA]" />
                  <span className="font-mono text-xs text-white">AI Co-Founder is analyzing models...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your AI Co-Founder strategic advice..."
              disabled={sending}
              className="flex-1 rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-white placeholder-[#958ea0] focus:outline-none focus:border-[#A78BFA] transition shadow-inner disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] p-2.5 sm:p-3 text-black font-bold transition disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.4)] cursor-pointer shrink-0"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>

        {/* Sidebar Context & Recommendations (1 Column) */}
        <div className="space-y-6">
          {/* Component 2: Startup Context Memory */}
          <Panel title="Startup Context Memory">
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-[#101417] p-3">
                <span className="font-mono font-bold text-[#A78BFA] text-[10px] uppercase">Idea Validation</span>
                <p className="text-white mt-0.5">{contextData?.validation || "Validation score synced"}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#101417] p-3">
                <span className="font-mono font-bold text-[#A78BFA] text-[10px] uppercase">MVP Scope</span>
                <p className="text-white mt-0.5">{contextData?.mvp || "2-week scope defined"}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#101417] p-3">
                <span className="font-mono font-bold text-[#A78BFA] text-[10px] uppercase">Build Roadmap</span>
                <p className="text-white mt-0.5">{contextData?.roadmap || "4-phase execution plan"}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#101417] p-3">
                <span className="font-mono font-bold text-[#A78BFA] text-[10px] uppercase">Traction Metrics</span>
                <p className="text-white mt-0.5">{contextData?.traction || "Active metrics tracked"}</p>
              </div>
            </div>
          </Panel>

          {/* Component 5: Action Recommendations Panel */}
          <Panel title="Action Recommendations">
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-3 space-y-1">
                <span className="font-bold text-[#A78BFA] flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> High Priority Action
                </span>
                <p className="text-white text-[11px]">Conduct 5 direct customer interviews before adding secondary MVP features.</p>
              </div>

              <div className="rounded-xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] p-3 space-y-1">
                <span className="font-bold text-[#A78BFA] flex items-center gap-1.5">
                  <ArrowRight className="size-3.5" /> Growth Loop Next Step
                </span>
                <p className="text-white text-[11px]">Enable 1-click founder referral incentives to scale MAU organically.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
