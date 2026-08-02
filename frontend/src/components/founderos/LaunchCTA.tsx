import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Rocket, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export const LaunchCTA: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Soft Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#4F8CFF]/20 via-[#121924]/40 to-[#64D8FF]/20 rounded-[40px] blur-3xl opacity-80 pointer-events-none" />

      {/* Main Container */}
      <div className="relative rounded-[32px] border border-white/10 bg-[#161F2D] backdrop-blur-3xl p-8 sm:p-16 text-center space-y-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#0E131C] text-xs font-mono text-[#64D8FF]">
          <span className="size-2 rounded-full bg-[#46E3A3] shadow-[0_0_8px_#46E3A3]" />
          <span className="font-bold">STARTUP OPERATING SYSTEM READY</span>
        </div>

        {/* Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-6xl font-bold font-display text-[#F5F8FC] tracking-tight leading-tight">
            Ready to Build Something <br />
            <span className="text-gradient-neural">Extraordinary?</span>
          </h2>
          <p className="text-base sm:text-lg text-[#A8B3C7] max-w-xl mx-auto">
            FounderOS isn't just another SaaS app — it is the operating system for building high-velocity, high-growth startups.
          </p>
        </div>

        {/* Action Form or Submitted Banner */}
        <div className="max-w-md mx-auto">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter founder email..."
                className="w-full sm:flex-1 px-4 py-3.5 rounded-xl border border-white/10 bg-[#0E131C] text-[#F5F8FC] placeholder-[#74839B] focus:outline-none focus:border-[#4F8CFF] focus:ring-1 focus:ring-[#4F8CFF]/40 font-mono text-sm"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl btn-system text-sm font-bold flex items-center justify-center gap-2 shrink-0 group shadow-[0_0_20px_rgba(79,140,255,0.3)]"
              >
                <Sparkles className="size-4 text-[#64D8FF]" />
                <span>Enter FounderOS</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl border border-[#46E3A3]/40 bg-[#46E3A3]/15 text-[#46E3A3] font-mono text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="size-5 text-[#46E3A3]" />
              <span className="font-bold">FOUNDEROS WORKSPACE READY. CHECK YOUR INBOX.</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#A8B3C7]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#46E3A3]" /> No Credit Card Required
            </span>
            <span>•</span>
            <span>Instant Workspace Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};
