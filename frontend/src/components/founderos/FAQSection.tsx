import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";

const FAQS = [
  {
    q: "How is FounderOS different from generic AI chats?",
    a: "Generic AI chats lack persistent startup context. FounderOS holds long-term memory across your customer interviews, tech stack specs, sprint checklists, and pitch data room."
  },
  {
    q: "What is the 7-Day Launch Sprint?",
    a: "A time-boxed execution framework that breaks your scoped MVP into daily shippable tasks with active scope-creep warnings, getting you to a live production URL in one week."
  },
  {
    q: "Can I use FounderOS solo or with a co-founding team?",
    a: "Both. Solo founders use the AI Copilot as an always-on technical and strategic sounding board. Co-founding teams use it as a single source of truth for specs, roadmaps, and investor updates."
  },
  {
    q: "How does the AI Copilot evaluate idea viability?",
    a: "It benchmarks your thesis against a 100-point scorecard covering problem severity, market timing, willingness-to-pay signals, unfair advantage, and 7-day build feasibility."
  },
  {
    q: "How do I share my investor data room?",
    a: "In one click. FounderOS generates a clean, live shareable link with cap table projections, verified customer validation signals, and MRR metrics."
  }
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Sticky Title & Info */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 self-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-xs font-mono text-[#A78BFA]">
            <HelpCircle className="size-3.5" />
            <span>CLARITY & DETAILS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Frequently Asked <span className="text-gradient-system">Questions</span>
          </h2>
          <p className="text-sm text-[#cbc3d7] leading-relaxed">
            Everything you need to know about navigating the FounderOS workspace.
          </p>
          <div className="pt-2">
            <a
              href="/signin"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#A78BFA] hover:text-white transition"
            >
              <MessageSquare className="size-3.5" />
              <span>Have more questions? Ask the AI Copilot &rarr;</span>
            </a>
          </div>
        </div>

        {/* Right Column: Clean Accordion (De-duplicated numbers) */}
        <div className="lg:col-span-8 space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`panel border transition-all rounded-2xl overflow-hidden ${
                  isOpen
                    ? "border-[rgba(139,92,246,0.4)] bg-[#101417]"
                    : "border-white/5 bg-[#0b0f12] hover:border-white/10"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`size-4 text-[#958ea0] transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-[#A78BFA]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-[#cbc3d7] leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
