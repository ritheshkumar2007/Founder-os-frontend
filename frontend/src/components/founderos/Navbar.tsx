import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Rocket, ChevronRight, Menu, X, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080A0F]/90 backdrop-blur-xl border-b border-white/5 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center size-10 rounded-xl bg-[#0E131C] border border-[#4F8CFF]/40 text-[#4F8CFF] shadow-[0_0_20px_rgba(79,140,255,0.25)] group-hover:border-[#4F8CFF] group-hover:shadow-[0_0_30px_rgba(79,140,255,0.45)] transition-all duration-300">
              <Rocket className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#4F8CFF]" />
              <div className="absolute -top-1 -right-1 size-2 rounded-full bg-[#4F8CFF] animate-ping opacity-80" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-[#F5F8FC] tracking-tight">
                  FOUNDER<span className="text-[#4F8CFF]">OS</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#4F8CFF]/30 bg-[#4F8CFF]/15 text-[#A9D6FF]">
                  v2.5
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#A8B3C7] tracking-widest uppercase -mt-0.5">
                STARTUP OS
              </span>
            </div>
          </Link>

          {/* System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-[#0E131C]/70 backdrop-blur-md text-xs font-mono text-[#A8B3C7]">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#46E3A3] opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-[#46E3A3]"></span>
            </span>
            <span className="text-[#F5F8FC] font-medium">OS OPERATIONAL</span>
            <span className="text-white/20">|</span>
            <span className="text-[#64D8FF]">12ms AI Latency</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#A8B3C7]">
            <a href="#hero" className="hover:text-[#F5F8FC] transition-colors duration-200">
              Workspace
            </a>
            <a href="#trajectory" className="hover:text-[#F5F8FC] transition-colors duration-200">
              Trajectory
            </a>
            <a href="#modules" className="hover:text-[#F5F8FC] transition-colors duration-200">
              App Modules
            </a>
            <a href="#simulator" className="hover:text-[#F5F8FC] transition-colors duration-200">
              Simulator
            </a>
            <a href="#mission-logs" className="hover:text-[#F5F8FC] transition-colors duration-200">
              Reviews
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/signin"
              search={{ mode: "signin" }}
              className="btn-frosted text-sm font-medium px-4 py-2 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/signin"
              search={{ mode: "signup" }}
              className="btn-system flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold group"
            >
              <Sparkles className="size-4 text-[#64D8FF]" />
              <span>Enter Operating System</span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-white/5 bg-[#0E131C] text-[#A8B3C7] hover:text-[#F5F8FC]"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/5 bg-[#0E131C]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#4F8CFF]">
              <span className="size-2 rounded-full bg-[#46E3A3] animate-pulse" />
              FOUNDEROS ONLINE
            </div>
          </div>
          <nav className="flex flex-col space-y-3 font-medium text-base text-[#A8B3C7]">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F5F8FC] py-1">
              Workspace
            </a>
            <a href="#trajectory" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F5F8FC] py-1">
              Trajectory
            </a>
            <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F5F8FC] py-1">
              App Modules
            </a>
            <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F5F8FC] py-1">
              Simulator
            </a>
            <a href="#mission-logs" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F5F8FC] py-1">
              Reviews
            </a>
          </nav>
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl btn-frosted font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl btn-system font-bold"
            >
              Enter Operating System
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
