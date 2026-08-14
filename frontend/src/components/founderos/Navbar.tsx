import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAppState } from "@/lib/founderos/store";

export const Navbar: React.FC = () => {
  const app = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#020408]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.2)] shadow-[0_0_15px_rgba(139,92,246,0.1)] flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-12 h-16">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
          <span
            className="material-symbols-outlined text-[#A78BFA] text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            terminal
          </span>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tighter text-white">
            FounderOS
          </span>
        </Link>

        {/* Hidden on Mobile, Flex on Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <a
            className="text-[#cbc3d7] hover:text-[#A78BFA] transition-colors font-mono text-xs uppercase tracking-wider"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-[#cbc3d7] hover:text-[#A78BFA] transition-colors font-mono text-xs uppercase tracking-wider"
            href="#pricing"
          >
            Pricing
          </a>
          <a
            className="text-[#cbc3d7] hover:text-[#A78BFA] transition-colors font-mono text-xs uppercase tracking-wider"
            href="#docs"
          >
            Docs
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {app.user ? (
            <Link
              to="/workspace/idea-validation"
              className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-mono font-bold text-xs px-5 py-2 rounded-lg active:scale-95 duration-200 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              <span>Workspace</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : (
            <Link
              to="/signin"
              className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-mono font-bold text-xs px-5 py-2 rounded-lg active:scale-95 duration-200 shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-[rgba(139,92,246,0.3)] bg-[#101417] text-[#cbc3d7] hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full z-40 bg-[#0b0f12]/98 backdrop-blur-2xl border-b border-[rgba(139,92,246,0.3)] px-6 py-6 flex flex-col gap-4 shadow-2xl">
          <nav className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#cbc3d7] hover:text-[#A78BFA] py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#cbc3d7] hover:text-[#A78BFA] py-2"
            >
              Pricing
            </a>
            <a
              href="#docs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#cbc3d7] hover:text-[#A78BFA] py-2"
            >
              Docs
            </a>
          </nav>
          <div className="pt-3 border-t border-white/10">
            {app.user ? (
              <Link
                to="/workspace/idea-validation"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-mono font-bold text-xs w-full text-center py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                <span>Enter Workspace</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#A78BFA] hover:bg-[#bfa8ff] text-black font-mono font-bold text-xs w-full text-center py-3 rounded-xl block shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

