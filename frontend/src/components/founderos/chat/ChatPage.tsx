import React, { useState, useEffect } from "react";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import type { ChatMessage } from "@/lib/founderos/types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ReportsDrawer, ReportItem } from "./ReportsDrawer";
import { ExecutionDrawer } from "./ExecutionDrawer";
import { GrowthDrawer } from "./GrowthDrawer";
import { IdeaScoreModal } from "./IdeaScoreModal";
import { generateMockAiResponse } from "./mockAiEngine";
import { deriveIdeaScore } from "@/lib/founderos/derive";
import api from "@/lib/api";

const INITIAL_GREETING_CONTENT = `Hi! I'm your FounderOS AI Coach.

I'm here to help you validate your startup and turn it into a successful business.

Instead of filling out forms, just tell me about your idea.

Let's begin.

What are you building?`;

export const ChatPage: React.FC = () => {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
  const [latestReports, setLatestReports] = useState<ReportItem[]>([]);

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

  // Auto-persist initial greeting to store if not present
  useEffect(() => {
    if (venture && (!venture.chat || venture.chat.length === 0)) {
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
      }));
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
      // Call real Gemini AI backend
      const res = await api.aiChat({
        ventureId: venture.id,
        message: text,
        history: updatedMessages,
      });

      const aiReplyText = res.success && res.data?.reply
        ? res.data.reply
        : generateMockAiResponse(text, updatedMessages, venture);

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
          building: v.brief.building || text,
        };
        const nextChat = [...updatedMessages, aiMsg];
        const nextScore = res.data?.ideaScore || deriveIdeaScore({ ...v, brief: nextBrief, chat: nextChat });
        return {
          ...v,
          chat: nextChat,
          brief: nextBrief,
          ideaScore: nextScore,
        };
      });
    } catch {
      const fallbackReply = generateMockAiResponse(text, updatedMessages, venture);
      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: fallbackReply,
        createdAt: new Date().toISOString(),
      };
      update((v) => {
        const nextBrief = {
          ...v.brief,
          building: v.brief.building || text,
        };
        const nextChat = [...updatedMessages, aiMsg];
        const nextScore = deriveIdeaScore({ ...v, brief: nextBrief, chat: nextChat });
        return {
          ...v,
          chat: nextChat,
          brief: nextBrief,
          ideaScore: nextScore,
        };
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#080A0F] text-[#F5F8FC] overflow-hidden selection:bg-[#4F8CFF]/30">
      {/* Header */}
      <ChatHeader
        onOpenScore={() => setScoreOpen(true)}
        onOpenReports={() => setReportsOpen(true)}
        onOpenExecution={() => setExecutionOpen(true)}
        onOpenGrowth={() => setGrowthOpen(true)}
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

      {/* Reports Drawer Overlay */}
      <ReportsDrawer
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        initialReports={latestReports}
      />

      {/* Execution OS Drawer Overlay */}
      <ExecutionDrawer
        open={executionOpen}
        onClose={() => setExecutionOpen(false)}
      />

      {/* Growth OS Drawer Overlay */}
      <GrowthDrawer
        open={growthOpen}
        onClose={() => setGrowthOpen(false)}
      />
    </div>
  );
};
