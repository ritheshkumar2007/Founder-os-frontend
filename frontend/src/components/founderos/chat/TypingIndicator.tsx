import React from "react";
import { Bot } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3.5 my-4 animate-fade-in">
      <div className="shrink-0 size-9 rounded-xl bg-gradient-to-br from-[#4F8CFF]/25 to-[#64D8FF]/15 border border-[#4F8CFF]/40 text-[#4F8CFF] flex items-center justify-center shadow-[0_0_15px_rgba(79,140,255,0.2)] mt-0.5">
        <Bot className="size-5 text-[#4F8CFF]" />
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-[#161F2D]/90 backdrop-blur-xl px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex items-center gap-2">
        <span className="size-2 rounded-full bg-[#4F8CFF] animate-bounce shadow-[0_0_8px_#4F8CFF]" style={{ animationDelay: "0ms" }} />
        <span className="size-2 rounded-full bg-[#64D8FF] animate-bounce shadow-[0_0_8px_#64D8FF]" style={{ animationDelay: "150ms" }} />
        <span className="size-2 rounded-full bg-[#46E3A3] animate-bounce shadow-[0_0_8px_#46E3A3]" style={{ animationDelay: "300ms" }} />
        <span className="text-xs font-mono text-[#A8B3C7] ml-2">AI Coach is thinking...</span>
      </div>
    </div>
  );
};
