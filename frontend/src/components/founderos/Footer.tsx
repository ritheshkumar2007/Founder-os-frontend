import React from "react";
import { Link } from "@tanstack/react-router";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative border-t border-glass-border bg-surface-container-lowest dark:bg-surface-container-lowest py-12 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4 z-10 pb-28 md:pb-12">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-zinc-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          terminal
        </span>
        <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tighter">
          FounderOS
        </span>
      </div>
      <p className="font-caption text-caption text-on-surface-variant text-center">
        © {new Date().getFullYear()} FounderOS. High-Velocity Systems.
      </p>
      <div className="flex gap-6">
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-zinc-300 transition-colors"
          href="#docs"
        >
          Documentation
        </a>
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-zinc-300 transition-colors"
          href="#"
        >
          Privacy
        </a>
        <a
          className="font-caption text-caption text-on-surface-variant hover:text-zinc-300 transition-colors"
          href="#"
        >
          Support
        </a>
      </div>
    </footer>
  );
};

