import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import type { ChatMessage } from "@/lib/founderos/types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { IdeaScoreModal } from "./IdeaScoreModal";
import { generateMockAiResponse } from "./mockAiEngine";
import { processValidationTurn, INITIAL_COACH_MESSAGE } from "@/lib/founderos/validationEngine";
import { deriveIdeaScore } from "@/lib/founderos/derive";
import { toast } from "sonner";
import api from "@/lib/api";
import type { ValidationState } from "@/lib/founderos/types";

const INITIAL_GREETING_CONTENT = INITIAL_COACH_MESSAGE;

export const ChatPage: React.FC = () => {
  const { venture, update } = useActiveVenture();
  const navigate = useNavigate();
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

      if (res.success && Array.isArray(res.data?.reports)) {
        setLatestReports(res.data.reports);
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
        const nextScore =
          nextValidationState.score ||
          res.data?.ideaScore ||
          deriveIdeaScore({ ...v, brief: nextBrief, chat: nextChat });

        return {
          ...v,
          chat: nextChat,
          brief: nextBrief,
          validationState: nextValidationState,
          ideaScore: nextScore,
        };
      });
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
        const nextScore =
          localTurn.updatedState.score ||
          deriveIdeaScore({ ...v, brief: nextBrief, chat: nextChat });

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
        setTimeout(() => {
          toast.success("Validation completed! Unlocked Stage 2: MVP Scope");
          navigate({ to: "/workspace/mvp-scope" as any });
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#020408] text-white overflow-hidden selection:bg-[rgba(139,92,246,0.3)]">
      {/* Header */}
      <ChatHeader
        onOpenScore={() => setScoreOpen(true)}
      />

      {/* Main Scrollable Chat Area */}
      <MessageList messages={messages} loading={loading} />

      {/* Bottom Input Area */}
      <ChatInput onSend={handleSendMessage} disabled={loading} />

      {/* 100-Point Idea Scorecard Modal */}
      <IdeaScoreModal
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
      />
    </div>
  );
};
