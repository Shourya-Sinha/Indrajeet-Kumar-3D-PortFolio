"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Download, Move3d, Sparkles } from "lucide-react";
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
      className="perspective-1600 relative flex min-h-screen items-center overflow-hidden pt-28 pb-20"
    >
      {/* Background volumetric glows */}
      <div className="pointer-events-none absolute -left-32 top-16 h-96 w-96 rounded-full bg-cyan-500/12 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-[28rem] w-[28rem] rounded-full bg-violet-600/14 blur-[150px]" />

      <div
        ref={contentRef}
        className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8"
      >
        {/* Left: Crisp Hero Identity, Headline & 3D CTAs */}
        <div className="lg:col-span-6">
          <div
            data-hero-reveal
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 shadow-[0_6px_20px_rgba(16,185,129,0.18)] backdrop-blur-md"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            {settings.availableForHire ? settings.availabilityStatus : hero.badgeText}
          </div>

          <div data-hero-reveal className="space-y-1.5">
            <div className="font-cyber text-base font-bold tracking-[0.22em] text-cyan-300 sm:text-lg">
              {hero.primaryName}
              <span className="ml-2.5 font-mono text-xs font-medium tracking-[0.16em] text-slate-300 sm:text-sm">
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
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[4rem]"
          >
            <span className="cyber-text-gradient">{hero.headline}</span>
          </h1>

          <p
            data-hero-reveal
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg"
          >
            {hero.subheading}
          </p>

          <div data-hero-reveal className="mt-8 flex flex-wrap items-center gap-3.5">
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

          {/* Compact 4-Tile 3D Telemetry Strip */}
          <div data-hero-reveal className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: "5+ Yrs", label: "Full-Stack", color: "text-cyan-300" },
              { value: "9.4 / 10", label: "MCA AppSec", color: "text-violet-300" },
              { value: "17", label: "Capabilities", color: "text-emerald-300" },
              { value: "8 Live", label: "Flagships", color: "text-sky-300" },
            ].map((item) => (
              <TiltCard3D key={item.label} maxTilt={12} depth={16}>
                <div className="glass-panel glass-panel-hover preserve-3d rounded-2xl px-3.5 py-3">
                  <div className={`depth-z-2 font-display text-lg font-bold ${item.color}`}>
                    {item.value}
                  </div>
                  <div className="depth-z-1 text-[11px] font-medium text-slate-400">
                    {item.label}
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </div>

        {/* Right: Dedicated Unobstructed Interactive 3D WebGL Viewport */}
        <div data-hero-reveal className="lg:col-span-6">
          <div className="holo-border-glow glass-panel relative h-[380px] overflow-hidden rounded-3xl border border-cyan-400/25 sm:h-[480px] lg:h-[520px]">
            {/* Crisp studio gradient framing matching obsidian-cyan-violet-rose palette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_46%_42%,rgba(0,229,255,0.16),rgba(147,51,234,0.11)_44%,rgba(244,63,94,0.06)_66%,transparent_80%)]" />

            {/* Live Interactive 3D Gyroscope Core */}
            <div className="relative z-10 h-full w-full cursor-grab active:cursor-grabbing">
              <HeroCanvas
                scrollProgressRef={scrollProgressRef}
                fallbackImageUrl={hero.heroImageUrl}
                distortion={hero.sceneConfig?.chromeDistortion}
                particleCount={hero.sceneConfig?.particleCount}
                rotationSpeed={hero.sceneConfig?.rotationSpeed}
              />
            </div>

            {/* Minimal Corner HUD Label (Zero Obstruction over Center Sculpture) */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-md">
                <Move3d className="h-3.5 w-3.5 text-cyan-300" />
                Drag to Spin 3D Core 360°
              </span>
              <span className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
                WebGL2 · Sculpted Gyro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-slate-400 transition hover:text-cyan-300"
      >
        <span>Scroll</span>
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-white/25 p-1">
          <ArrowDown className="h-3 w-3 animate-bounce text-cyan-300" />
        </span>
      </a>
    </section>
  );
}
