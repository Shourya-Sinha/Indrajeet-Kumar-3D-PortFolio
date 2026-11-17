"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import type { ServiceDoc } from "@/lib/db/types";
import { TiltCard3D } from "@/components/ui/TiltCard3D";

gsap.registerPlugin(ScrollTrigger);

const ServicesStageCanvas = dynamic(
  () => import("@/components/three/ServicesStageCanvas").then((m) => m.ServicesStageCanvas),
  { ssr: false }
);

export function ServicesPinnedSection({
  services,
  onRequestService,
}: {
  services: ServiceDoc[];
  onRequestService?: (serviceTitle: string) => void;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedDetail, setExpandedDetail] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const pinTarget = pinTargetRef.current;
    if (!container || !pinTarget || services.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const trigger = ScrollTrigger.create({
        trigger: pinTarget,
        pin: true,
        scrub: 0.7,
        start: "top top",
        end: () => `+=${Math.max(services.length * 360, 2200)}`,
        anticipatePin: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const idx = Math.min(
            services.length - 1,
            Math.floor(self.progress * services.length)
          );
          setActiveIndex((prev) => (prev !== idx ? idx : prev));
        },
      });
      return () => trigger.kill();
    });

    return () => mm.revert();
  }, [services.length]);

  if (services.length === 0) return null;
  const active = services[activeIndex] || services[0];

  const handleRequest = (title: string) => {
    if (onRequestService) {
      onRequestService(title);
    }
    const contactEl = document.getElementById("contact");
    contactEl?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={containerRef} id="services" className="perspective-1600 relative bg-[#050608]/90">
      <div
        ref={pinTargetRef}
        className="relative flex min-h-screen flex-col justify-center overflow-hidden border-y border-white/10 py-14 lg:py-8"
      >
        {/* Ambient Accent Glow */}
        <div className="pointer-events-none absolute right-0 top-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Bar: Eyebrow + Step Progress */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Layers className="h-3.5 w-3.5" />
                Immersive 3D Solutions Stage · {services.length} Capabilities
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Pinned Scroll 3D Solutions Stage
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-200 transition hover:border-cyan-400/40 disabled:opacity-35"
                aria-label="Previous service"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-mono text-xs text-cyan-300">
                {String(activeIndex + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.min(services.length - 1, i + 1))}
                disabled={activeIndex === services.length - 1}
                className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-200 transition hover:border-cyan-400/40 disabled:opacity-35"
                aria-label="Next service"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress Rail */}
          <div className="mb-7 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(0,229,255,0.65)] transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / services.length) * 100}%` }}
            />
          </div>

          {/* Split Storytelling 3D Stage */}
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Left: Interactive 3D Narrative Card */}
            <div className="space-y-5 lg:col-span-6">
              <TiltCard3D maxTilt={8} depth={20}>
                <div
                  key={active._id}
                  className="glass-panel glass-panel-hover preserve-3d animate-3d-flip rounded-3xl p-6 sm:p-8"
                >
                  <div className="depth-z-2 flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold text-cyan-400/90 sm:text-4xl">
                      {active.numberLabel}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-slate-300">
                      {active.sceneThemeKey}
                    </span>
                  </div>

                  <h3 className="depth-z-2 mt-3 font-display text-2xl font-bold text-white sm:text-4xl">
                    {active.title}
                  </h3>
                  <p className="depth-z-1 mt-2 text-sm font-medium text-cyan-200/90 sm:text-base">
                    {active.shortTagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {active.description}
                  </p>

                  {/* Deliverables */}
                  <div className="depth-z-1 mt-5 grid gap-2 sm:grid-cols-2">
                    {active.deliverables.map((del) => (
                      <div
                        key={del}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>

                  {/* Technology Labels */}
                  <div className="depth-z-1 mt-5 flex flex-wrap gap-1.5">
                    {active.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="depth-z-2 mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() => handleRequest(active.title)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_4px_0_rgba(14,116,144,0.7),0_0_25px_rgba(0,229,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
                    >
                      {active.ctaLabel || "Request Service"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedDetail((v) => !v)}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                    >
                      {expandedDetail ? "Hide Directory" : "Learn More / All 17"}
                    </button>
                  </div>
                </div>
              </TiltCard3D>
            </div>

            {/* Right: Synchronized 3D Visual + Interactive Tilt Stage */}
            <div className="space-y-4 lg:col-span-6">
              <TiltCard3D maxTilt={9} depth={22} glowAccent="violet">
                <div className="holo-border-glow glass-panel glass-panel-hover preserve-3d relative h-[320px] overflow-hidden rounded-3xl sm:h-[400px]">
                  <img
                    key={active.imageUrl}
                    src={active.imageUrl}
                    alt={active.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/50" />
                  <div className="relative z-10 h-full w-full">
                    <ServicesStageCanvas
                      activeIndex={activeIndex}
                      progressRef={progressRef}
                      fallbackImageUrl={active.imageUrl}
                    />
                  </div>
                  <div className="depth-z-2 pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs text-slate-300">
                    <span className="rounded-full border border-white/15 bg-black/65 px-3 py-1 backdrop-blur-md">
                      Scroll or select step to morph 3D environment
                    </span>
                    <span className="font-mono text-cyan-300">{active.numberLabel}</span>
                  </div>
                </div>
              </TiltCard3D>

              {/* Quick Step Selector Matrix */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {services.map((srv, idx) => (
                  <button
                    key={srv._id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    title={srv.title}
                    className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                      idx === activeIndex
                        ? "border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_16px_rgba(0,229,255,0.22)]"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/35 hover:text-white"
                    }`}
                  >
                    {srv.numberLabel} · {srv.title.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {expandedDetail && (
            <div className="animate-3d-flip mt-6 grid max-h-52 gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0e14] p-4 sm:grid-cols-3 lg:grid-cols-4">
              {services.map((srv, idx) => (
                <button
                  key={srv._id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setExpandedDetail(false);
                  }}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                    idx === activeIndex
                      ? "border-cyan-400/60 bg-cyan-400/15 text-white"
                      : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25"
                  }`}
                >
                  <span className="font-mono text-cyan-300">{srv.numberLabel}</span> {srv.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
