import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import type { ChatMessage, ValidationSession, ValidationState } from "@/lib/founderos/types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { IdeaScoreModal } from "./IdeaScoreModal";
import { processValidationTurn, INITIAL_COACH_MESSAGE } from "@/lib/founderos/validationEngine";
import { deriveIdeaScore } from "@/lib/founderos/derive";
import { toast } from "sonner";
import api from "@/lib/api";
import { History, Plus, Trash2, Award, Clock, ChevronRight, Sparkles, CheckCircle2, Bot } from "lucide-react";

const INITIAL_GREETING_CONTENT = INITIAL_COACH_MESSAGE;

export const ChatPage: React.FC = () => {
  const { venture, update } = useActiveVenture();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Initialize conversation with exact initial greeting if empty
  const messages: ChatMessage[] = React.useMemo(() => {
    if (!venture) return [];
    if (venture.chat && venture.chat.length > 0) {
      return venture.chat;
    }
    return [
      {
        id: "initial-ai-greeting",
        role: "assistant",
        content: INITIAL_GREETING_CONTENT,
        createdAt: new Date().toISOString(),
      },
    ];
  }, [venture?.id, venture?.chat]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-persist initial greeting and default validationState to store if not present
  useEffect(() => {
    if (venture) {
      const needsChatInit = !venture.chat || venture.chat.length === 0;
      const needsStateInit = !venture.validationState;

      if (needsChatInit || needsStateInit) {
        update((v) => ({
          ...v,
          validationState: v.validationState || {
            currentQuestion: 1,
            answers: {
              question1: null,
              question2: null,
              question3: null,
              question4: null,
              question5: null,
            },
            completed: false,
            score: null,
          },
          chat: needsChatInit
            ? [
                {
                  id: uid(),
                  role: "assistant",
                  content: INITIAL_GREETING_CONTENT,
                  createdAt: new Date().toISOString(),
                },
              ]
            : v.chat,
        }));
      }
    }
  }, [venture?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear current chat & Start fresh 5-question validation interview
  const handleClearAndStartNewValidation = () => {
    if (!venture) return;

    const currentHasProgress =
      venture.validationState?.completed ||
      venture.validationState?.answers?.question1 ||
      (venture.chat && venture.chat.length > 1);

    if (currentHasProgress) {
      const sessionTitle =
        venture.validationState?.answers?.question1 ||
        venture.brief?.problem ||
        venture.brief?.building ||
        venture.name ||
        `Validated Idea (${new Date().toLocaleDateString()})`;

      const cleanTitle = sessionTitle.length > 40 ? sessionTitle.slice(0, 40) + "..." : sessionTitle;

      const newSession: ValidationSession = {
        id: uid(),
        title: cleanTitle,
        createdAt: new Date().toISOString(),
        validationState: venture.validationState || {
          currentQuestion: 1,
          answers: { question1: null, question2: null, question3: null, question4: null, question5: null },
          completed: false,
          score: null,
        },
        ideaScore: venture.ideaScore || null,
        chat: venture.chat || [],
        brief: venture.brief,
      };

      update((v) => ({
        ...v,
        validationSessions: [newSession, ...(v.validationSessions || []).filter((s) => s.id !== newSession.id)],
        chat: [
          {
            id: uid(),
            role: "assistant",
            content: INITIAL_GREETING_CONTENT,
            createdAt: new Date().toISOString(),
          },
        ],
        validationState: {
          currentQuestion: 1,
          answers: {
            question1: null,
            question2: null,
            question3: null,
            question4: null,
            question5: null,
          },
          completed: false,
          score: null,
        },
        ideaScore: null,
      }));

      toast.success("Previous idea saved to history! Starting fresh 5-question validation interview.");
    } else {
      update((v) => ({
        ...v,
        chat: [
          {
            id: uid(),
            role: "assistant",
            content: INITIAL_GREETING_CONTENT,
            createdAt: new Date().toISOString(),
          },
        ],
        validationState: {
          currentQuestion: 1,
          answers: {
            question1: null,
            question2: null,
            question3: null,
            question4: null,
            question5: null,
          },
          completed: false,
          score: null,
        },
        ideaScore: null,
      }));
      toast.info("Validation chat reset.");
    }
  };

  // Restore a previous validation session from history
  const handleRestoreSession = (session: ValidationSession) => {
    if (!venture) return;

    // If active chat has unsaved progress, archive it first
    const activeHasProgress =
      venture.validationState?.completed ||
      venture.validationState?.answers?.question1 ||
      (venture.chat && venture.chat.length > 1);

    update((v) => {
      let sessions = v.validationSessions || [];
      if (activeHasProgress) {
        const activeTitle =
          v.validationState?.answers?.question1 ||
          v.brief?.problem ||
          `Validated Idea (${new Date().toLocaleDateString()})`;

        const cleanActiveTitle = activeTitle.length > 40 ? activeTitle.slice(0, 40) + "..." : activeTitle;

        const currentActiveSession: ValidationSession = {
          id: uid(),
          title: cleanActiveTitle,
          createdAt: new Date().toISOString(),
          validationState: v.validationState || {
            currentQuestion: 1,
            answers: { question1: null, question2: null, question3: null, question4: null, question5: null },
            completed: false,
            score: null,
          },
          ideaScore: v.ideaScore || null,
          chat: v.chat || [],
          brief: v.brief,
        };
        sessions = [currentActiveSession, ...sessions.filter((s) => s.id !== session.id)];
      }

      return {
        ...v,
        validationSessions: sessions,
        chat: session.chat,
        validationState: session.validationState,
        ideaScore: session.ideaScore,
        brief: session.brief || v.brief,
      };
    });

    toast.success(`Loaded saved validation: "${session.title}"`);
    setHistoryOpen(false);
  };

  // Delete a previous validation session from history
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    update((v) => ({
      ...v,
      validationSessions: (v.validationSessions || []).filter((s) => s.id !== sessionId),
    }));
    toast.info("Removed validation session from history.");
  };

  const handleSendMessage = async (text: string) => {
    if (!venture || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];

    // Optimistically update store with user message
    update((v) => ({
      ...v,
      chat: updatedMessages,
    }));

    setLoading(true);

    try {
      // Call AI backend with explicit validation state
      const res = await api.aiChat({
        ventureId: venture.id,
        message: text,
        page: "idea-validation",
        validationState: venture.validationState,
        history: updatedMessages,
      });

      let aiReplyText = "";
      let nextValidationState: ValidationState = venture.validationState || {
        currentQuestion: 1,
        answers: {
          question1: null,
          question2: null,
          question3: null,
          question4: null,
          question5: null,
        },
        completed: false,
        score: null,
      };

      if (res.success && res.data?.reply) {
        aiReplyText = res.data.reply;
        if (res.data?.validationState) {
          nextValidationState = res.data.validationState;
        } else {
          const localTurn = processValidationTurn({
            userMessage: text,
            validationState: venture.validationState,
            venture,
          });
          nextValidationState = localTurn.updatedState;
        }
      } else {
        const localTurn = processValidationTurn({
          userMessage: text,
          validationState: venture.validationState,
          venture,
        });
        aiReplyText = localTurn.reply;
        nextValidationState = localTurn.updatedState;
      }

      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: aiReplyText,
        createdAt: new Date().toISOString(),
      };

      update((v) => {
        const nextBrief = {
          ...v.brief,
          building: v.brief.building || nextValidationState.answers.question1 || text,
          problem: nextValidationState.answers.question1 || v.brief.problem,
          audience: nextValidationState.answers.question1 || v.brief.audience,
          workaround: nextValidationState.answers.question2 || v.brief.workaround,
          outcome: nextValidationState.answers.question3 || v.brief.outcome,
        };
        const nextChat = [...updatedMessages, aiMsg];
        const nextScore = nextValidationState.completed
          ? (nextValidationState.score || res.data?.ideaScore || deriveIdeaScore({ ...v, brief: nextBrief, chat: nextChat, validationState: nextValidationState }))
          : null;

        return {
          ...v,
          chat: nextChat,
          brief: nextBrief,
          validationState: nextValidationState,
          ideaScore: nextScore,
        };
      });

      if (nextValidationState.completed) {
        setScoreOpen(true);
        toast.success("Validation completed! Unlocked Stage 2: MVP Scope");
      }
    } catch {
      const localTurn = processValidationTurn({
        userMessage: text,
        validationState: venture.validationState,
        venture,
      });

      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: localTurn.reply,
        createdAt: new Date().toISOString(),
      };

      update((v) => {
        const nextBrief = {
          ...v.brief,
          building: v.brief.building || localTurn.updatedState.answers.question1 || text,
          problem: localTurn.updatedState.answers.question1 || v.brief.problem,
          audience: localTurn.updatedState.answers.question1 || v.brief.audience,
          workaround: localTurn.updatedState.answers.question2 || v.brief.workaround,
          outcome: localTurn.updatedState.answers.question3 || v.brief.outcome,
        };
        const nextChat = [...updatedMessages, aiMsg];
        const nextScore = localTurn.updatedState.completed
          ? (localTurn.updatedState.score || deriveIdeaScore({ ...v, brief: nextBrief, chat: nextChat, validationState: localTurn.updatedState }))
          : null;

        return {
          ...v,
          chat: nextChat,
          brief: nextBrief,
          validationState: localTurn.updatedState,
          ideaScore: nextScore,
        };
      });

      if (localTurn.updatedState.completed) {
        setScoreOpen(true);
        toast.success("Validation completed! Unlocked Stage 2: MVP Scope");
      }
    } finally {
      setLoading(false);
    }
  };

  const validationSessions = venture?.validationSessions || [];

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#020408] text-white overflow-hidden selection:bg-[rgba(139,92,246,0.3)] relative">
      {/* Header with Clear Chat & History Buttons */}
      <ChatHeader
        onOpenScore={() => setScoreOpen(true)}
        onClearChat={handleClearAndStartNewValidation}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        savedCount={validationSessions.length}
        historyOpen={historyOpen}
      />

      {/* Main Content Area (History Sidebar + Chat Stream) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ChatGPT-Style Previous Sessions Sidebar / Drawer */}
        <aside
          className={`absolute inset-y-0 left-0 z-30 w-72 sm:w-80 bg-[#080b0e] border-r border-[rgba(139,92,246,0.2)] flex flex-col transition-all duration-300 ease-in-out md:relative ${
            historyOpen ? "translate-x-0" : "-translate-x-full md:-ml-80"
          }`}
        >
          {/* Top New Validation Button */}
          <div className="p-3 border-b border-white/5 space-y-2">
            <button
              onClick={handleClearAndStartNewValidation}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] py-2 px-3 text-xs font-bold text-black transition shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Validate Another Idea</span>
            </button>
            <p className="text-[11px] font-mono text-[#958ea0] text-center">
              {validationSessions.length} saved validation {validationSessions.length === 1 ? "session" : "sessions"}
            </p>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {validationSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 px-4 text-center text-xs text-[#958ea0] space-y-2">
                <History className="size-6 text-[#A78BFA]/50" />
                <p className="font-medium text-[#cbc3d7]">No Saved Validations Yet</p>
                <p className="text-[11px] leading-relaxed">
                  When you complete the 5 validation questions, your session will automatically save here so you never have to repeat them.
                </p>
              </div>
            ) : (
              validationSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleRestoreSession(session)}
                  className="group relative flex flex-col gap-1.5 p-2.5 rounded-xl border border-white/5 bg-[#0f1317] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.1)] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-white truncate group-hover:text-[#A78BFA]">
                      {session.title || "Validated Idea"}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      title="Delete saved validation"
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#958ea0] hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#958ea0]">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-[#A78BFA]" />
                      {new Date(session.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    {session.ideaScore?.overallScore ? (
                      <span className="rounded bg-[rgba(139,92,246,0.2)] px-1.5 py-0.5 font-bold text-[#A78BFA]">
                        {session.ideaScore.overallScore}/100
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">Complete</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Scrollable Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <MessageList messages={messages} loading={loading} />
          <ChatInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </div>

      {/* 100-Point Idea Scorecard Modal */}
      <IdeaScoreModal
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
      />
    </div>
  );
};
