import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

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
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-radial-aurora rounded-3xl blur-3xl opacity-80 pointer-events-none" />

      {/* Main Container */}
      <div className="glass-card relative rounded-2xl p-5 sm:p-10 lg:p-14 text-center space-y-6 sm:space-y-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[#101417] text-[11px] sm:text-xs font-mono text-[#A78BFA]">
          <span className="size-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]" />
          <span className="font-bold">STARTUP OPERATING SYSTEM READY</span>
        </div>

        {/* Headline */}
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-headline-lg text-white tracking-tight leading-tight">
            Ready to Build Something <br />
            <span className="text-gradient-neural">Extraordinary?</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#cbc3d7] max-w-xl mx-auto">
            Take your startup from raw idea to live product. Validate customer demand, scope your precision MVP, and ship in 7 days.
          </p>
        </div>

        {/* Action Form */}
        <div className="max-w-md mx-auto">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter founder email..."
                className="w-full sm:flex-1 px-4 py-3 rounded-lg border border-[rgba(139,92,246,0.3)] bg-[#0b0f12] text-white placeholder-[#958ea0] focus:outline-none focus:border-[#A78BFA] font-mono text-sm"
              />
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto px-6 py-3 rounded-lg font-mono text-sm font-bold flex items-center justify-center gap-2 shrink-0 group active:scale-95 duration-200 cursor-pointer bg-[#A78BFA] text-black hover:bg-[#bfa8ff]"
              >
                <Sparkles className="size-4 text-black" />
                <span>Enter FounderOS</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 text-black" />
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-lg border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.15)] text-[#A78BFA] font-mono text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="size-5 text-[#A78BFA]" />
              <span className="font-bold">FOUNDEROS WORKSPACE READY. CHECK YOUR INBOX.</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#cbc3d7]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#A78BFA]" /> No Credit Card Required
            </span>
            <span>•</span>
            <span>Instant Workspace Access</span>
          </div>
        </div>
      </div>
    </section>
  );
};

