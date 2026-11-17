"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Download, Sparkles } from "lucide-react";
import type { HeroContentDoc, SiteSettingsDoc } from "@/lib/db/types";
import { MagneticButton } from "@/components/ui/MagneticButton";

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
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.09,
          duration: 0.85,
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
      className="relative flex min-h-screen items-center overflow-hidden pt-20 pb-16"
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
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl">
          <div
            data-hero-reveal
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            {settings.availableForHire ? settings.availabilityStatus : hero.badgeText}
          </div>

          <div data-hero-reveal className="space-y-1">
            <div className="font-display text-sm font-bold tracking-[0.26em] text-cyan-300 sm:text-base">
              {hero.primaryName}
              <span className="ml-3 text-xs font-medium tracking-[0.18em] text-slate-400">
                / {hero.alternateName}
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
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]"
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
