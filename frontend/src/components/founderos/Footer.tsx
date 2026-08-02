import React from "react";
import { Link } from "@tanstack/react-router";
import { Rocket, ShieldCheck, Activity } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/5 bg-[#080A0F] pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-xl bg-[#0E131C] border border-[#4F8CFF]/40 text-[#4F8CFF] shadow-[0_0_20px_rgba(79,140,255,0.25)]">
              <Rocket className="size-4 text-[#4F8CFF]" />
            </div>
            <span className="font-display font-bold text-lg text-[#F5F8FC] tracking-tight">
              FOUNDER<span className="text-[#4F8CFF]">OS</span>
            </span>
          </Link>
          <p className="text-xs text-[#A8B3C7] max-w-sm leading-relaxed">
            Purpose-built AI Startup Operating System for entrepreneurs. From raw idea brief to scaled, high-growth venture.
          </p>

          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-[#0E131C] text-[11px] font-mono text-[#A8B3C7]">
            <span className="size-2 rounded-full bg-[#46E3A3] animate-pulse" />
            <span>OS OPERATIONAL</span>
            <span className="text-white/20">|</span>
            <span className="text-[#64D8FF]">12ms Latency</span>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3 font-mono text-xs">
          <p className="text-[#F5F8FC] font-bold uppercase tracking-wider">Workspace</p>
          <ul className="space-y-2 text-[#A8B3C7]">
            <li><a href="#hero" className="hover:text-[#4F8CFF] transition-colors">Control Deck</a></li>
            <li><a href="#trajectory" className="hover:text-[#4F8CFF] transition-colors">Startup Trajectory</a></li>
            <li><a href="#modules" className="hover:text-[#4F8CFF] transition-colors">App Modules</a></li>
            <li><a href="#simulator" className="hover:text-[#4F8CFF] transition-colors">AI Simulator</a></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3 font-mono text-xs">
          <p className="text-[#F5F8FC] font-bold uppercase tracking-wider">Resources</p>
          <ul className="space-y-2 text-[#A8B3C7]">
            <li><a href="#mission-logs" className="hover:text-[#4F8CFF] transition-colors">Reviews & Case Studies</a></li>
            <li><Link to="/signin" className="hover:text-[#4F8CFF] transition-colors">Investor Data Room</Link></li>
            <li><Link to="/signin" className="hover:text-[#4F8CFF] transition-colors">7-Day Sprint Guide</Link></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#4F8CFF] transition-colors">GitHub Sync</a></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className="space-y-3 font-mono text-xs">
          <p className="text-[#F5F8FC] font-bold uppercase tracking-wider">System Specs</p>
          <ul className="space-y-2 text-[#A8B3C7]">
            <li><span>Security: SOC-2 Compliant</span></li>
            <li><span>Latency: &lt; 12ms Global</span></li>
            <li><span>Isolation: 100% Data Encrypted</span></li>
            <li><span>Uptime: 99.99%</span></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#A8B3C7] gap-4">
        <p>© {new Date().getFullYear()} FounderOS Inc. All systems operational.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#F5F8FC] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#F5F8FC] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#F5F8FC] transition-colors">Security System</a>
        </div>
      </div>
    </footer>
  );
};
