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
    <div className="sticky bottom-0 z-20 border-t border-[rgba(139,92,246,0.25)] bg-[#0b0f12]/95 backdrop-blur-2xl px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#101417]/90 p-2 sm:p-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)] focus-within:border-[#A78BFA] focus-within:shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Describe your startup idea..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#958ea0] resize-none outline-none max-h-40 px-2 py-1 scrollbar-thin"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex items-center justify-center size-10 rounded-xl bg-[#A78BFA] hover:bg-[#bfa8ff] text-black shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all shrink-0 cursor-pointer"
          >
            <Send className="size-4 text-black" />
          </button>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#958ea0] mt-2 px-1">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="size-3 text-[#A78BFA]" /> Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white font-sans">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white font-sans">Shift + Enter</kbd> for new line
          </span>
          <span className="hidden sm:inline text-[#cbc3d7]">FounderOS AI Assistant v2.5</span>
        </div>
      </div>
    </div>
  );
};
