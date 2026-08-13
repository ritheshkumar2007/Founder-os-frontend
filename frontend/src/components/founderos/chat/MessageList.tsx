import React, { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/founderos/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-2 selection:bg-[rgba(139,92,246,0.3)]">
      <div className="max-w-4xl mx-auto space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
