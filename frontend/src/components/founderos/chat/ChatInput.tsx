import React, { useState, useRef, useEffect } from "react";
import { Send, CornerDownLeft } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#0E131C]/95 backdrop-blur-2xl px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 rounded-2xl border border-white/15 bg-[#161F2D]/90 p-2 sm:p-3 shadow-[0_15px_40px_rgba(0,0,0,0.5)] focus-within:border-[#4F8CFF]/60 focus-within:shadow-[0_0_25px_rgba(79,140,255,0.25)] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Describe your startup idea..."
            className="flex-1 bg-transparent text-sm text-[#F5F8FC] placeholder:text-[#A8B3C7] resize-none outline-none max-h-40 px-2 py-1 scrollbar-thin"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#2563EB] text-[#F5F8FC] shadow-[0_0_15px_rgba(79,140,255,0.4)] hover:shadow-[0_0_25px_rgba(79,140,255,0.6)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all shrink-0"
          >
            <Send className="size-4" />
          </button>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#A8B3C7] mt-2 px-1">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="size-3 text-[#4F8CFF]" /> Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white font-sans">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white font-sans">Shift + Enter</kbd> for new line
          </span>
          <span className="hidden sm:inline">FounderOS AI Assistant v2.5</span>
        </div>
      </div>
    </div>
  );
};
