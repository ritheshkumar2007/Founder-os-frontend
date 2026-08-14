import React, { useState, useEffect } from "react";
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

const INITIAL_GREETING_CONTENT = INITIAL_COACH_MESSAGE;

export const ChatPage: React.FC = () => {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-full w-full bg-[#020408] text-white overflow-hidden selection:bg-[rgba(139,92,246,0.3)]">
      {/* Full-width Header with Clear Chat / Validate Another Idea & Score Buttons */}
      <ChatHeader
        onOpenScore={() => setScoreOpen(true)}
        onClearChat={handleClearAndStartNewValidation}
      />

      {/* Full Screen Chat Stream & Input Area */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        <MessageList messages={messages} loading={loading} />
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>

      {/* 100-Point Idea Scorecard Modal */}
      <IdeaScoreModal
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
      />
    </div>
  );
};
