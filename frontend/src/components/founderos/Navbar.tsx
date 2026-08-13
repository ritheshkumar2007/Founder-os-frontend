import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAppState } from "@/lib/founderos/store";

export const Navbar: React.FC = () => {
  const app = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-glass-border shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-zinc-300 text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            terminal
          </span>
          <span className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface">
            FounderOS
          </span>
        </Link>

        {/* Hidden on Mobile, Flex on Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            className="text-on-surface-variant hover:text-primary transition-colors font-label-mono text-label-mono"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors font-label-mono text-label-mono"
            href="#pricing"
          >
            Pricing
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors font-label-mono text-label-mono"
            href="#docs"
          >
            Docs
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {app.user ? (
            <Link
              to="/workspace/idea-validation"
              className="btn-primary px-6 py-2 rounded-lg font-label-mono text-label-mono active:scale-95 duration-200 flex items-center gap-2"
            >
              <span>Workspace</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : (
            <Link
              to="/signin"
              className="btn-primary px-6 py-2 rounded-lg font-label-mono text-label-mono active:scale-95 duration-200"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-glass-border text-on-surface-variant hover:text-on-surface"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-2xl border-b border-glass-border px-6 py-6 flex flex-col gap-4">
          <nav className="flex flex-col gap-3 font-label-mono text-label-mono">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-on-surface-variant hover:text-primary py-1"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-on-surface-variant hover:text-primary py-1"
            >
              Pricing
            </a>
            <a
              href="#docs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-on-surface-variant hover:text-primary py-1"
            >
              Docs
            </a>
          </nav>
          <div className="pt-2 border-t border-glass-border">
            {app.user ? (
              <Link
                to="/workspace/idea-validation"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center py-2.5 rounded-lg font-label-mono text-label-mono flex items-center justify-center gap-2"
              >
                <span>Enter Workspace</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center py-2.5 rounded-lg font-label-mono text-label-mono block"
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

