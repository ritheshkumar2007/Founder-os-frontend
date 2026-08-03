import React, { useState, useEffect } from "react";
import { uid, useActiveVenture } from "@/lib/founderos/store";
import type { ChatMessage } from "@/lib/founderos/types";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import api from "@/lib/api";

const INITIAL_GREETING_CONTENT = `Hi! I'm your FounderOS AI Coach.

I'm here to help you validate your startup and turn it into a successful business.

Instead of filling out forms, just tell me about your idea.

Let's begin.

What are you building?`;

export const ChatPage: React.FC = () => {
  const { venture, update } = useActiveVenture();
  const [loading, setLoading] = useState(false);

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
        message: text,
        history: updatedMessages,
      });

      const aiReplyText = res.success && res.data?.reply
        ? res.data.reply
        : (res.error || "I'm having trouble connecting right now. Please try again in a moment.");

      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: aiReplyText,
        createdAt: new Date().toISOString(),
      };

      update((v) => ({
        ...v,
        chat: [...updatedMessages, aiMsg],
        brief: {
          ...v.brief,
          building: v.brief.building || text,
        },
      }));
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        createdAt: new Date().toISOString(),
      };
      update((v) => ({ ...v, chat: [...updatedMessages, errorMsg] }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#080A0F] text-[#F5F8FC] overflow-hidden selection:bg-[#4F8CFF]/30">
      {/* Header */}
      <ChatHeader />

      {/* Main Scrollable Chat Area */}
      <MessageList messages={messages} loading={loading} />

      {/* Bottom Input Area */}
      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
};
