"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const BINARY_STREAM = [
  "01001001 01001110 01000100 01010010 01000001",
  "01001010 01000101 01000101 01010100 00100000",
  "01001011 01010101 01001101 01000001 01010010",
  "01010011 01001000 01001111 01010101 01010010",
];

export function FuturisticPreloader({
  brandName = "INDRAJEET KUMAR",
  alternateName = "Shourya Sinha",
}: {
  brandName?: string;
  alternateName?: string;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isLanding) {
      setDismissed(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDismissed(true);
      return;
    }

    const start = performance.now();
    const duration = 1650;
    let rafId = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    const frame = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2.3);
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        setExiting(true);
        exitTimer = setTimeout(() => setDismissed(true), 500);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [isLanding]);

  if (!isLanding || dismissed) return null;

  const activeBinary = BINARY_STREAM[Math.floor((progress / 26) % BINARY_STREAM.length)];

  const handleSkip = () => {
    setProgress(100);
    setExiting(true);
    setTimeout(() => setDismissed(true), 300);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading 3D Portfolio Environment"
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[#040508] px-6 py-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 sm:py-10 ${
        exiting ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      {/* Top Minimal Identity Header */}
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
        <span>
          {brandName} <span className="text-slate-600">/</span> ({alternateName})
        </span>
        <span className="hidden sm:inline text-slate-500">
          ARCHIVE · WEBGL · FULL-STACK
        </span>
      </div>

      {/* Center Editorial Binary & Percentage Stage */}
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 font-mono text-[11px] tracking-[0.35em] text-cyan-300/70">
          {activeBinary}
        </div>

        <div className="flex items-baseline justify-between gap-6">
          <div className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {progress < 100 ? "Constructing 3D Experience" : "Entering Workspace"}
          </div>
          <div className="font-cyber text-4xl font-bold tabular-nums text-white sm:text-7xl">
            {String(progress).padStart(3, "0")}
            <span className="text-cyan-300">%</span>
          </div>
        </div>

        {/* Clean 1px Hairline Progress Track */}
        <div className="mt-8 h-px w-full overflow-hidden bg-white/15">
          <div
            className="h-full bg-gradient-to-r from-white via-cyan-300 to-cyan-400 transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <span>Loading GLSL shaders & spatial routes</span>
        <button
          type="button"
          onClick={handleSkip}
          className="text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
}
