"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";

const BOOT_MESSAGES = [
  { at: 0, text: "[SYS.01] INITIALIZING WEBGL2 SPATIAL MATRICES & SHADERS..." },
  { at: 28, text: "[SYS.02] CONSTRUCTING 3D EXPERIENCE GLOBE & 17 STAGES..." },
  { at: 58, text: "[SYS.03] MOUNTING 8 FLAGSHIP SYSTEMS & ATS RESUME ENGINE..." },
  { at: 86, text: "[ONLINE] INDRAJEET KUMAR (SHOURYA SINHA) // ENTERING 3D SPACE" },
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
    const duration = 1850;
    let rafId = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    const frame = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Smooth sci-fi ease curve (fast initial build, crisp lock at 100%)
      const eased = 1 - Math.pow(1 - t, 2.4);
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        setExiting(true);
        exitTimer = setTimeout(() => setDismissed(true), 550);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [isLanding]);

  if (!isLanding || dismissed) return null;

  const activeMessage =
    [...BOOT_MESSAGES].reverse().find((m) => progress >= m.at)?.text ??
    BOOT_MESSAGES[0].text;

  const handleSkip = () => {
    setProgress(100);
    setExiting(true);
    setTimeout(() => setDismissed(true), 320);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading 3D Portfolio Environment"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#040508] transition-all duration-500 ease-out ${
        exiting
          ? "pointer-events-none scale-110 opacity-0 blur-md"
          : "scale-100 opacity-100"
      }`}
    >
      {/* Multi-Hue Radial Holographic Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,0.16),transparent_42%),radial-gradient(circle_at_72%_68%,rgba(147,51,234,0.18),transparent_46%),radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.08),transparent_58%)]" />

      {/* Subtle Isometric Grid + Moving Laser Scanline */}
      <div className="bg-ambient-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="animate-scan-beam pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/12 to-transparent" />

      {/* Top HUD Bar */}
      <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[11px] font-mono tracking-[0.2em] text-slate-400 sm:inset-x-10">
        <span className="inline-flex items-center gap-2 text-cyan-300">
          <Cpu className="h-3.5 w-3.5 animate-pulse" />
          WEBGL2 // SPATIAL TELEMETRY
        </span>
        <span className="hidden text-violet-300 sm:inline">
          BUILDING 3D CONTENT · CORE READY
        </span>
      </div>

      {/* Central 3D Holographic Assembly */}
      <div className="perspective-1200 relative z-10 flex w-full max-w-xl flex-col items-center px-6 text-center">
        {/* Concentric Rotating Rings + 3D Spinning Tesseract Core */}
        <div className="preserve-3d relative mb-10 flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
          {/* Outer Rose-Violet Radar Ring */}
          <div
            className="absolute inset-0 animate-spin rounded-full border border-dashed border-violet-400/45 shadow-[0_0_32px_rgba(147,51,234,0.28)]"
            style={{ animationDuration: "9s" }}
          />
          {/* Middle Electric Cyan Orbital Ring */}
          <div
            className="absolute inset-4 animate-spin rounded-full border-2 border-cyan-400/50 border-t-rose-400 border-r-transparent shadow-[0_0_36px_rgba(0,229,255,0.3)]"
            style={{ animationDuration: "4.5s", animationDirection: "reverse" }}
          />
          {/* Inner 3D Isometric Cube */}
          <div className="cube-3d animate-spin-prism h-12 w-12">
            <span className="cube-face" style={{ transform: "translateZ(24px)" }} />
            <span className="cube-face" style={{ transform: "rotateY(180deg) translateZ(24px)" }} />
            <span className="cube-face" style={{ transform: "rotateY(90deg) translateZ(24px)" }} />
            <span className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(24px)" }} />
            <span className="cube-face" style={{ transform: "rotateX(90deg) translateZ(24px)" }} />
            <span className="cube-face" style={{ transform: "rotateX(-90deg) translateZ(24px)" }} />
          </div>
        </div>

        {/* Brand Identity */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.26em] text-cyan-200">
          <Sparkles className="h-3 w-3 text-cyan-300" />
          Constructing 3D Experience
        </div>

        <h2 className="font-cyber mt-4 text-2xl font-bold tracking-[0.2em] text-white sm:text-4xl">
          <span className="cyber-text-gradient">{brandName}</span>
        </h2>
        <p className="mt-1.5 font-mono text-xs tracking-[0.24em] text-slate-300">
          ({alternateName.toUpperCase()})
        </p>

        {/* Numeric Counter & Multi-Hue Progress Track */}
        <div className="mt-8 w-full max-w-md">
          <div className="mb-2.5 flex items-end justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {progress < 100 ? "Building Content" : "Launch Ready"}
            </span>
            <span className="font-cyber text-2xl font-bold text-cyan-300 tabular-nums sm:text-3xl">
              {String(progress).padStart(3, "0")}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full border border-white/15 bg-white/[0.06] p-0.5 shadow-[0_0_24px_rgba(0,229,255,0.18)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 via-violet-500 to-rose-500 shadow-[0_0_16px_rgba(0,229,255,0.8)] transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 min-h-[20px] font-mono text-[11px] tracking-wide text-cyan-200/90">
            {activeMessage}
          </div>
        </div>
      </div>

      {/* Bottom Right Skip Trigger */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 backdrop-blur-md transition hover:border-cyan-400/50 hover:bg-cyan-400/15 hover:text-cyan-200 sm:bottom-8 sm:right-10"
      >
        Skip Intro <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
