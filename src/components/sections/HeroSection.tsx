"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Cpu, Download, Layers, Shield, Sparkles } from "lucide-react";
import type { HeroContentDoc, SiteSettingsDoc } from "@/lib/db/types";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard3D } from "@/components/ui/TiltCard3D";

gsap.registerPlugin(ScrollTrigger);

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

export function HeroSection({
  hero,
  settings,
  latestVersion,
}: {
  hero: HeroContentDoc;
  settings: SiteSettingsDoc;
  latestVersion?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        content.querySelectorAll("[data-hero-reveal]"),
        { y: 34, z: -40, rotateX: 12, opacity: 0, transformPerspective: 1200 },
        {
          y: 0,
          z: 0,
          rotateX: 0,
          opacity: 1,
          stagger: 0.09,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform",
        }
      );

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="perspective-1600 relative flex min-h-screen items-center overflow-hidden pt-24 pb-20"
    >
      {/* Background volumetric glows */}
      <div className="pointer-events-none absolute -left-32 top-16 h-96 w-96 rounded-full bg-cyan-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-[28rem] w-[28rem] rounded-full bg-violet-600/15 blur-[150px]" />

      {/* Interactive 3D Hero Canvas */}
      <div className="absolute inset-0 z-0 opacity-95">
        <HeroCanvas
          scrollProgressRef={scrollProgressRef}
          fallbackImageUrl={hero.heroImageUrl}
          distortion={hero.sceneConfig?.chromeDistortion}
          particleCount={hero.sceneConfig?.particleCount}
          rotationSpeed={hero.sceneConfig?.rotationSpeed}
        />
      </div>

      {/* Subtle readability gradient overlay on left */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#050608]/90 via-[#050608]/55 to-transparent" />

      <div
        ref={contentRef}
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8"
      >
        <div className="lg:col-span-7">
          <div
            data-hero-reveal
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 shadow-[0_6px_20px_rgba(16,185,129,0.18)] backdrop-blur-md"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            {settings.availableForHire ? settings.availabilityStatus : hero.badgeText}
          </div>

          <div data-hero-reveal className="space-y-1.5">
            <div className="font-display text-base font-bold tracking-[0.24em] text-cyan-300 sm:text-lg">
              {hero.primaryName}
              <span className="ml-2.5 text-xs font-medium tracking-[0.16em] text-slate-300 sm:text-sm">
                ({hero.alternateName})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-300 sm:text-sm">
              {hero.roles.map((r, i) => (
                <React.Fragment key={r}>
                  {i > 0 && <span className="text-cyan-400/60">|</span>}
                  <span>{r}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <h1
            data-hero-reveal
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]"
          >
            <span className="cyber-text-gradient">{hero.headline}</span>
          </h1>

          <p
            data-hero-reveal
            className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg"
          >
            {hero.subheading}
          </p>

          <div data-hero-reveal className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton href="#projects" variant="primary">
              <Sparkles className="h-4 w-4" />
              {hero.primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>

            <MagneticButton href="#contact" variant="secondary">
              {hero.secondaryCtaLabel}
            </MagneticButton>

            <MagneticButton
              href={`/api/public/resume/download/${encodeURIComponent(latestVersion || "v1.0")}/pdf`}
              variant="ghost"
              download
            >
              <Download className="h-4 w-4 text-cyan-300" />
              {hero.resumeCtaLabel} ({latestVersion || "v1.0"})
            </MagneticButton>
          </div>
        </div>

        {/* Right: Floating Interactive 3D Spatial Architecture Deck */}
        <div data-hero-reveal className="lg:col-span-5">
          <TiltCard3D maxTilt={13} depth={26} floatIdle glowAccent="cyan">
            <div className="glass-panel glass-panel-hover preserve-3d relative rounded-3xl border border-cyan-400/25 p-6 sm:p-7">
              <div className="depth-z-2 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                    3D Engineering Matrix
                  </div>
                  <div className="mt-1 font-display text-lg font-bold text-white">
                    {hero.primaryName}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      ({hero.alternateName})
                    </span>
                  </div>
                </div>

                {/* Live Spinning CSS 3D Isometric Cube */}
                <div className="perspective-1200 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-400/10">
                  <div className="cube-3d animate-spin-prism h-6 w-6">
                    <span className="cube-face" style={{ transform: "translateZ(12px)" }} />
                    <span className="cube-face" style={{ transform: "rotateY(180deg) translateZ(12px)" }} />
                    <span className="cube-face" style={{ transform: "rotateY(90deg) translateZ(12px)" }} />
                    <span className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(12px)" }} />
                    <span className="cube-face" style={{ transform: "rotateX(90deg) translateZ(12px)" }} />
                    <span className="cube-face" style={{ transform: "rotateX(-90deg) translateZ(12px)" }} />
                  </div>
                </div>
              </div>

              <div className="depth-z-1 mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-2 text-xs text-cyan-300">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Experience</span>
                  </div>
                  <div className="mt-1.5 font-display text-2xl font-bold text-white">5+ Yrs</div>
                  <div className="text-[11px] text-slate-400">MERN & React Native</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-2 text-xs text-violet-300">
                    <Shield className="h-3.5 w-3.5" />
                    <span>MCA AppSec</span>
                  </div>
                  <div className="mt-1.5 font-display text-2xl font-bold text-white">9.4 / 10</div>
                  <div className="text-[11px] text-slate-400">Amrita Cybersecurity</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Solutions</span>
                  </div>
                  <div className="mt-1.5 font-display text-2xl font-bold text-white">17 Tracks</div>
                  <div className="text-[11px] text-slate-400">Web · Mobile · AI · Sec</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center gap-2 text-xs text-sky-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Flagships</span>
                  </div>
                  <div className="mt-1.5 font-display text-2xl font-bold text-white">8 Live</div>
                  <div className="text-[11px] text-slate-400">Interactive Demos</div>
                </div>
              </div>

              <div className="depth-z-3 mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-400/20 bg-black/50 px-4 py-3 text-xs">
                <span className="text-slate-300">Move cursor across cards to inspect 3D depth</span>
                <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
                  WEBGL2 · R3F
                </span>
              </div>
            </div>
          </TiltCard3D>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-400 transition hover:text-cyan-300"
      >
        <span>Scroll</span>
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-white/25 p-1">
          <ArrowDown className="h-3 w-3 animate-bounce text-cyan-300" />
        </span>
      </a>
    </section>
  );
}
