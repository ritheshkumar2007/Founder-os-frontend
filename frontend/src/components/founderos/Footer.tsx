import React from "react";
import { Link } from "@tanstack/react-router";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative border-t border-glass-border bg-surface-container-lowest dark:bg-surface-container-lowest py-8 sm:py-12 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 z-10 pb-24 md:pb-12 text-center md:text-left">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-electric-violet text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          terminal
        </span>
        <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tighter">
          FounderOS
        </span>
      </div>
      <p className="font-caption text-caption text-on-surface-variant text-center">
        © {new Date().getFullYear()} FounderOS. The Startup Operating System.
      </p>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-electric-violet transition-colors"
          href="#trajectory"
        >
          5-Stage System
        </a>
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-electric-violet transition-colors"
          href="#simulator"
        >
          AI Simulator
        </a>
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-electric-violet transition-colors"
          href="#faq"
        >
          FAQ
        </a>
      </div>
    </footer>
  );
};

