import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How is FounderOS different from traditional SaaS tools or generic AI chats?",
    a: "Generic AI chats lack venture context and memory. FounderOS is a purpose-built AI Startup Operating System for founders. It enforces strict venture validation frameworks, integrates customer pain scoring, scopes zero-bloat MVPs, and builds your investor data room automatically."
  },
  {
    q: "What is the 7-Day Launch Sprint framework?",
    a: "Scope creep kills early ventures. The 7-Day Launch Sprint is a time-boxed execution engine built into FounderOS. It locks down your MVP features, sets daily sprint milestones, and provides technical copilot assistance so you ship live software in 7 days."
  },
  {
    q: "Can I use FounderOS solo or with a co-founder team?",
    a: "Both! Solo founders use FounderOS as a 24/7 technical and strategic copilot. Co-founding teams use FounderOS as a unified single workspace to align on product specs, sprint tasks, customer interview data, and pitch updates."
  },
  {
    q: "How does the AI copilot learn about my specific industry?",
    a: "When you create a venture brief, FounderOS initializes a dedicated context memory tailored to your venture. As you log customer interview data, market research, and code specs, your copilot grows smarter and provides ultra-personalized guidance."
  },
  {
    q: "How do I export my pitch brief and investor data room?",
    a: "With one click in your FounderOS workspace. FounderOS generates password-protected, live shareable links containing your unit economics, validated customer pain scores, 7-day product roadmap, and cap table analytics."
  }
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-xs font-mono text-[#A78BFA]">
          <HelpCircle className="size-3.5" />
          <span>FOUNDEROS FAQ</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
          Frequently Asked <span className="text-gradient-system">Questions</span>
        </h2>
        <p className="text-sm text-[#cbc3d7]">
          Everything you need to know before stepping into FounderOS.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="panel border border-[rgba(139,92,246,0.25)] bg-[#0b0f12] overflow-hidden transition-all rounded-2xl"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
              >
                <span className="text-base font-bold font-display text-white flex items-center gap-3">
                  <span className="text-xs font-mono text-[#A78BFA]">0{idx + 1}.</span>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`size-5 text-[#958ea0] transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[#A78BFA]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-sm text-[#cbc3d7] leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
