import React from "react";
import type { ChatMessage } from "@/lib/founderos/types";
import { Bot, User, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";

  // Formatter for markdown-style bullet points and bolding
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Check for bullet point
      if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-2 text-sm">
            <span className="text-[#4F8CFF] font-bold mt-0.5">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: line
                  .replace(/^[•-]\s*/, "")
                  .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#F5F8FC] font-semibold'>$1</strong>"),
              }}
            />
          </div>
        );
      }

      // Standard line
      return (
        <p
          key={idx}
          className={idx > 0 ? "mt-2 text-sm leading-relaxed" : "text-sm leading-relaxed"}
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#F5F8FC] font-semibold'>$1</strong>"),
          }}
        />
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-3.5 my-4 transition-all duration-300 animate-fade-in ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="shrink-0 size-9 rounded-xl bg-gradient-to-br from-[#4F8CFF]/25 to-[#64D8FF]/15 border border-[#4F8CFF]/40 text-[#4F8CFF] flex items-center justify-center shadow-[0_0_15px_rgba(79,140,255,0.2)] mt-0.5">
          <Bot className="size-5 text-[#4F8CFF]" />
        </div>
      )}

      {/* Message Container */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 text-sm transition-all shadow-md ${
          isAssistant
            ? "rounded-tl-sm border border-white/10 bg-[#161F2D]/90 backdrop-blur-xl text-[#F5F8FC] shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
            : "rounded-tr-sm bg-gradient-to-br from-[#4F8CFF] to-[#2563EB] text-[#F5F8FC] shadow-[0_4px_20px_rgba(79,140,255,0.35)]"
        }`}
      >
        {/* Role header for assistant */}
        {isAssistant && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#64D8FF] mb-2 font-medium">
            <Sparkles className="size-3" />
            <span>FOUNDEROS AI COACH</span>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1">{renderFormattedContent(message.content)}</div>

        {/* Timestamp */}
        <div
          className={`text-[10px] font-mono mt-2.5 text-right ${
            isAssistant ? "text-[#A8B3C7]" : "text-white/70"
          }`}
        >
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Founder Avatar */}
      {!isAssistant && (
        <div className="shrink-0 size-9 rounded-xl bg-[#1E293B] border border-white/10 text-[#F5F8FC] flex items-center justify-center shadow-md mt-0.5">
          <User className="size-5 text-[#A8B3C7]" />
        </div>
      )}
    </div>
  );
};
