"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Disc3, Download, Move3d } from "lucide-react";
import type { HeroContentDoc, SiteSettingsDoc } from "@/lib/db/types";
import { MagneticButton } from "@/components/ui/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

const FOCUS_TICKER = [
  "Attack Path Discovery v2.5 · Neo4j Graph Security",
  "Private Local LLMs · Ollama + GGUF Workflows",
  "Three.js + Custom GLSL Interactive Shaders",
  "Zero-Trust API Architecture & Next.js Systems",
];

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
  const [istTime, setIstTime] = useState<string>("--:--:-- IST");
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
        setIstTime(`${formatted} IST`);
      } catch {
        setIstTime("IST");
      }
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    const tickerTimer = setInterval(() => {
      setTickerIdx((i) => (i + 1) % FOCUS_TICKER.length);
    }, 3400);

    return () => {
      clearInterval(clockTimer);
      clearInterval(tickerTimer);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        content.querySelectorAll("[data-hero-reveal]"),
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
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
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20"
    >
      {/* Full-Bleed Unboxed GLSL + 3D Sculpture Canvas */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <HeroCanvas
          scrollProgressRef={scrollProgressRef}
          fallbackImageUrl={hero.heroImageUrl}
          distortion={hero.sceneConfig?.chromeDistortion}
          particleCount={hero.sceneConfig?.particleCount}
          rotationSpeed={hero.sceneConfig?.rotationSpeed}
        />
      </div>

      {/* Editorial Left-to-Right Readability Scrim (Zero Hard Borders) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#040508]/95 via-[#040508]/68 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-[#040508] to-transparent"
      />

      <div
        ref={contentRef}
        className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-auto max-w-3xl">
          {/* Authentic Top Telemetry Line (Location · Live IST Clock · Availability) */}
          <div
            data-hero-reveal
            className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400"
          >
            <span className="inline-flex items-center gap-2 text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {settings.availableForHire ? settings.availabilityStatus : hero.badgeText}
            </span>
            <span className="text-slate-600">/</span>
            <span>{settings.location || "India"}</span>
            <span className="text-slate-600">/</span>
            <span className="tabular-nums text-slate-200">{istTime}</span>
          </div>

          {/* Primary Name + Craft Roles */}
          <div data-hero-reveal className="space-y-2">
            <div className="font-cyber text-sm font-bold tracking-[0.26em] text-cyan-300 sm:text-base">
              {hero.primaryName}
              <span className="ml-2.5 font-mono text-xs font-normal tracking-[0.16em] text-slate-400">
                ({hero.alternateName})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400 sm:text-sm">
              {hero.roles.map((r, i) => (
                <React.Fragment key={r}>
                  {i > 0 && <span className="text-slate-600">·</span>}
                  <span>{r}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Sculptural Editorial Headline */}
          <h1
            data-hero-reveal
            className="mt-6 font-display text-4xl font-bold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-[4.4rem]"
          >
            <span className="cyber-text-gradient">{hero.headline}</span>
          </h1>

          <p
            data-hero-reveal
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg"
          >
            {hero.subheading}
          </p>

          {/* Rotating "Currently crafting" Focus Ticker */}
          <div
            data-hero-reveal
            className="mt-6 inline-flex items-center gap-2.5 font-mono text-xs text-slate-400"
          >
            <Disc3 className="h-3.5 w-3.5 animate-spin text-cyan-300" style={{ animationDuration: "5s" }} />
            <span className="text-slate-500">In lab:</span>
            <span className="text-slate-200 transition-opacity duration-300">
              {FOCUS_TICKER[tickerIdx]}
            </span>
          </div>

          {/* Clean CTAs */}
          <div data-hero-reveal className="mt-8 flex flex-wrap items-center gap-3.5">
            <MagneticButton href="#projects" variant="primary">
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

          {/* Clean Hairline Editorial Facts (No Heavy Rounded Stat Boxes) */}
          <div
            data-hero-reveal
            className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/10"
          >
            {[
              { value: "5+ Yrs", label: "Full-Stack Systems" },
              { value: "9.4 / 10", label: "MCA Cybersecurity" },
              { value: "17", label: "Service Stages" },
              { value: "8 Live", label: "Flagship Builds" },
            ].map((item, idx) => (
              <div key={item.label} className={idx > 0 ? "sm:pl-6" : "sm:pr-6"}>
                <div className="font-display text-xl font-bold text-white sm:text-2xl">
                  {item.value}
                </div>
                <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Edge Bar */}
      <div className="pointer-events-none absolute inset-x-6 bottom-6 z-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 sm:inset-x-10">
        <a
          href="#about"
          aria-label="Scroll to About section"
          className="pointer-events-auto inline-flex items-center gap-2 transition hover:text-cyan-300"
        >
          <span>Scroll</span>
          <ArrowDown className="h-3.5 w-3.5 text-cyan-300" />
        </a>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Move3d className="h-3.5 w-3.5 text-cyan-300/80" />
          Drag 3D Space · GLSL Surface
        </span>
      </div>
    </section>
  );
}
