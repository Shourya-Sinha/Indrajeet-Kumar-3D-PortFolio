"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Type } from "lucide-react";

export interface FontPreset {
  id: string;
  label: string;
  shortLabel: string;
  tagline: string;
  display: string;
  cyber: string;
  sans: string;
  mono: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "cyber-syne",
    label: "Cyber Syne",
    shortLabel: "Syne",
    tagline: "Syne + Orbitron + Outfit",
    display: '"Syne", "Orbitron", system-ui, sans-serif',
    cyber: '"Orbitron", "Syne", system-ui, sans-serif',
    sans: '"Outfit", "Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  {
    id: "adrien-editorial",
    label: "Studio Editorial",
    shortLabel: "Space",
    tagline: "Space Grotesk + Sora + Jakarta",
    display: '"Space Grotesk", "Sora", system-ui, sans-serif',
    cyber: '"Sora", "Space Grotesk", system-ui, sans-serif',
    sans: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  {
    id: "mecha-orbit",
    label: "Mecha Orbit",
    shortLabel: "Orbitron",
    tagline: "Orbitron HUD + Outfit",
    display: '"Orbitron", "Syne", system-ui, sans-serif',
    cyber: '"Orbitron", system-ui, sans-serif',
    sans: '"Outfit", "Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  {
    id: "sora-minimal",
    label: "Sora Minimal",
    shortLabel: "Sora",
    tagline: "Sora + Space Grotesk + Inter",
    display: '"Sora", "Space Grotesk", system-ui, sans-serif',
    cyber: '"Space Grotesk", "Sora", system-ui, sans-serif',
    sans: '"Inter", "Outfit", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  {
    id: "terminal-mono",
    label: "Terminal Mono",
    shortLabel: "Mono",
    tagline: "JetBrains Mono Precision",
    display: '"JetBrains Mono", ui-monospace, monospace',
    cyber: '"JetBrains Mono", ui-monospace, monospace',
    sans: '"JetBrains Mono", ui-monospace, monospace',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
];

const STORAGE_KEY = "ik_font_preset";

function applyFontPreset(preset: FontPreset) {
  const root = document.documentElement;
  root.style.setProperty("--font-display", preset.display);
  root.style.setProperty("--font-cyber", preset.cyber);
  root.style.setProperty("--font-sans", preset.sans);
  root.style.setProperty("--font-mono", preset.mono);
}

export function FontStyleSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("cyber-syne");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const match = FONT_PRESETS.find((p) => p.id === saved);
        if (match) {
          setActiveId(match.id);
          applyFontPreset(match);
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const activePreset =
    FONT_PRESETS.find((p) => p.id === activeId) || FONT_PRESETS[0];

  const handleSelect = (preset: FontPreset) => {
    setActiveId(preset.id);
    applyFontPreset(preset);
    try {
      window.localStorage.setItem(STORAGE_KEY, preset.id);
    } catch {
      // Ignore storage errors
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change portfolio font style"
        title="Switch typography preset"
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-all duration-200 xl:text-xs ${
          open
            ? "border-white/30 bg-white/10 text-cyan-300"
            : "border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/30 hover:text-white"
        } ${compact ? "w-full justify-between" : ""}`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-cyan-300" />
          <span>{activePreset.shortLabel}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-cyan-300" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Font presets"
          className={`glass-panel z-[70] mt-2 w-64 rounded-2xl border border-white/15 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.85)] ${
            compact ? "static w-full" : "absolute right-0"
          }`}
        >
          <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
            Typography Engine
          </div>
          <div className="mt-1 space-y-1">
            {FONT_PRESETS.map((preset) => {
              const selected = preset.id === activePreset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(preset)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                    selected
                      ? "border-cyan-400/50 bg-cyan-400/15 text-white shadow-[0_0_16px_rgba(0,229,255,0.2)]"
                      : "border-transparent bg-white/[0.02] text-slate-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div>
                    <div
                      className="text-xs font-bold"
                      style={{ fontFamily: preset.display }}
                    >
                      {preset.label}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {preset.tagline}
                    </div>
                  </div>
                  {selected && <Check className="h-3.5 w-3.5 shrink-0 text-cyan-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
