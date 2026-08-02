import React from "react";
import { Globe, ShieldCheck, Activity, Cpu, Zap, Server } from "lucide-react";

interface Hub {
  city: string;
  region: string;
  ventures: number;
  latency: string;
  status: string;
}

const HUBS: Hub[] = [
  { city: "San Francisco", region: "North America", ventures: 412, latency: "8ms", status: "Active" },
  { city: "New York", region: "North America", ventures: 198, latency: "12ms", status: "Active" },
  { city: "London", region: "Europe", ventures: 164, latency: "14ms", status: "Active" },
  { city: "Berlin", region: "Europe", ventures: 112, latency: "16ms", status: "Active" },
  { city: "Bengaluru", region: "Asia Pacific", ventures: 145, latency: "22ms", status: "Active" },
  { city: "Tokyo", region: "Asia Pacific", ventures: 98, latency: "24ms", status: "Active" },
  { city: "Singapore", region: "Asia Pacific", ventures: 111, latency: "18ms", status: "Active" },
];

export const GlobalOrbitalCanvas: React.FC = () => {
  return (
    <section className="relative py-20 px-4 max-w-7xl mx-auto z-10">
      <div className="panel p-8 sm:p-12 border border-white/10 bg-[#161F2D] backdrop-blur-2xl relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] rounded-3xl">
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4F8CFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#0E131C] text-xs font-mono text-[#64D8FF] shadow-sm">
              <Globe className="size-3.5 text-[#4F8CFF]" />
              <span>GLOBAL WORKSPACE ECOSYSTEM</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold font-display text-[#F5F8FC] tracking-tight leading-tight">
              1,240+ Startups Operating <br />
              <span className="text-gradient-neural">Across 42 Innovation Hubs</span>
            </h3>

            <p className="text-sm text-[#A8B3C7] leading-relaxed">
              From San Francisco to Tokyo, entrepreneurs rely on FounderOS to turn raw ideas into validated, high-velocity ventures with zero waste and full data security.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 rounded-2xl border border-white/5 bg-[#0E131C] space-y-1">
                <span className="text-[#74839B] uppercase text-[10px]">AI Latency</span>
                <p className="text-lg font-bold text-[#46E3A3]">12ms Avg</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-[#0E131C] space-y-1">
                <span className="text-[#74839B] uppercase text-[10px]">Active Hubs</span>
                <p className="text-lg font-bold text-[#4F8CFF]">42 Hubs</p>
              </div>
            </div>
          </div>

          {/* Right Global Hub Matrix */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {HUBS.map((h) => (
              <div
                key={h.city}
                className="p-4 rounded-2xl border border-white/5 bg-[#121924] transition-all duration-200 hover:border-[#4F8CFF]/40 hover:bg-[#1A2433] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#46E3A3] shadow-[0_0_8px_#46E3A3]" />
                    <span className="font-semibold text-sm text-[#F5F8FC]">{h.city}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A8B3C7]">
                    {h.region}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#A8B3C7] pt-1">
                  <span>{h.ventures} Active Ventures</span>
                  <span className="text-[#64D8FF]">{h.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
