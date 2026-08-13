import React from "react";
import { Bot } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3.5 my-4 animate-fade-in">
      <div className="shrink-0 size-9 rounded-xl bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)] text-[#A78BFA] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)] mt-0.5">
        <Bot className="size-5 text-[#A78BFA]" />
      </div>

      <div className="rounded-2xl rounded-tl-sm border border-[rgba(139,92,246,0.3)] bg-[#101417]/90 backdrop-blur-xl px-5 py-4 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-2">
        <span className="size-2 rounded-full bg-[#A78BFA] animate-bounce shadow-[0_0_8px_#A78BFA]" style={{ animationDelay: "0ms" }} />
        <span className="size-2 rounded-full bg-[#8B5CF6] animate-bounce shadow-[0_0_8px_#8B5CF6]" style={{ animationDelay: "150ms" }} />
        <span className="size-2 rounded-full bg-white animate-bounce shadow-[0_0_8px_white]" style={{ animationDelay: "300ms" }} />
        <span className="text-xs font-mono text-[#cbc3d7] ml-2">AI Co-Founder is thinking...</span>
      </div>
    </div>
  );
};
