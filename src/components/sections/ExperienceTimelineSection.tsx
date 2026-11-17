"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Calendar, MapPin, Move3d } from "lucide-react";
import type { ExperienceDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";

gsap.registerPlugin(ScrollTrigger);

const ExperienceGlobeCanvas = dynamic(
  () =>
    import("@/components/three/ExperienceGlobeCanvas").then(
      (m) => m.ExperienceGlobeCanvas
    ),
  { ssr: false }
);

export function ExperienceTimelineSection({
  experiences,
}: {
  experiences: ExperienceDoc[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-exp-item]"),
        {
          y: 44,
          z: -70,
          rotateX: 16,
          rotateY: -5,
          scale: 0.94,
          opacity: 0,
          transformPerspective: 1400,
        },
        {
          y: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          opacity: 1,
          stagger: 0.14,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (experiences.length === 0) return null;

  const activeExp = experiences[activeIdx] || experiences[0];
  const activeDateRange = activeExp.startDate
    ? `${activeExp.startDate} – ${activeExp.endDate}`
    : activeExp.endDate;
  const scrubberPct =
    experiences.length > 1 ? (activeIdx / (experiences.length - 1)) * 100 : 100;

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="perspective-1600 relative py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Professional Experience · Interactive 3D Globe"
            title="5+ Years Shipping Production Systems"
            subtitle="Explore career milestones on an interactive WebGL2 spatial globe — click any orbital node or step marker to spin into that chapter."
          />

          {/* Interactive Top Scrubber Bar (inspired by 3D Cinematic Timeline) */}
          <div className="w-full max-w-sm">
            <div className="mb-2 flex items-center justify-between font-cyber text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <span>Timeline Orbit</span>
              <span className="text-rose-400">
                Node {String(activeIdx + 1).padStart(2, "0")} /{" "}
                {String(experiences.length).padStart(2, "0")}
              </span>
            </div>
            <div className="relative flex h-6 items-center">
              <div className="h-1 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-violet-500 to-cyan-400 shadow-[0_0_16px_rgba(244,63,94,0.85)] transition-all duration-300"
                  style={{ width: `${Math.max(8, scrubberPct)}%` }}
                />
              </div>
              <div className="absolute inset-x-0 flex items-center justify-between">
                {experiences.map((exp, idx) => {
                  const selected = idx === activeIdx;
                  return (
                    <button
                      key={exp._id}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      aria-label={`Select milestone ${idx + 1}: ${exp.role}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300 ${
                        selected
                          ? "scale-110 border-rose-300 bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.9)]"
                          : "border-white/20 bg-[#0b0e16] text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 3D Globe Stage + Floating Milestone Card */}
        <div className="holo-border-glow glass-panel relative mt-12 overflow-hidden rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-500/12 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-cyan-500/12 blur-[130px]" />

          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Left/Center: Live Interactive 3D Globe */}
            <div className="relative h-[340px] sm:h-[420px] lg:col-span-6">
              <div className="h-full w-full cursor-grab active:cursor-grabbing">
                <ExperienceGlobeCanvas
                  count={experiences.length}
                  activeIndex={activeIdx}
                  onSelectIndex={setActiveIdx}
                />
              </div>
              <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-md">
                  <Move3d className="h-3.5 w-3.5 text-rose-400" />
                  Drag Globe · Click Nodes 01–{String(experiences.length).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-rose-400/35 bg-rose-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-rose-300 backdrop-blur-md">
                  Orbital Path
                </span>
              </div>
            </div>

            {/* Right: Floating 3D Milestone Spotlight Card */}
            <div className="lg:col-span-6">
              <TiltCard3D maxTilt={8} depth={22}>
                <div
                  key={activeExp._id}
                  className="glass-panel preserve-3d animate-3d-flip rounded-2xl border border-rose-400/30 bg-[#080b14]/85 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)] sm:p-7"
                >
                  <div className="depth-z-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-cyber text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                      Milestone {String(activeIdx + 1).padStart(2, "0")} ·{" "}
                      {activeExp.startDate || activeExp.endDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-200">
                      <Calendar className="h-3 w-3 text-cyan-300" />
                      {activeDateRange}
                    </span>
                  </div>

                  <h3 className="depth-z-2 mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                    {activeExp.role}
                  </h3>
                  <div className="depth-z-1 mt-1.5 flex flex-wrap items-center gap-3 text-sm text-cyan-200">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Briefcase className="h-4 w-4 text-cyan-300" />
                      {activeExp.company}
                    </span>
                    {activeExp.location && (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {activeExp.location}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {activeExp.description}
                  </p>

                  <ul className="depth-z-1 mt-4 space-y-2 text-xs text-slate-300 sm:text-sm">
                    {activeExp.responsibilities.slice(0, 3).map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="depth-z-1 mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                    {activeExp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[11px] text-cyan-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>

        {/* Full Synchronized 3D Career Timeline */}
        <div className="relative mt-14 pl-6 sm:pl-10">
          <div className="absolute bottom-2 left-2.5 top-2 w-0.5 bg-gradient-to-b from-rose-500 via-violet-500/80 to-cyan-400/50 shadow-[0_0_16px_rgba(244,63,94,0.45)] sm:left-4" />

          <div className="space-y-6">
            {experiences.map((exp, idx) => {
              const dateRange = exp.startDate
                ? `${exp.startDate} – ${exp.endDate}`
                : exp.endDate;
              const isSelected = idx === activeIdx;

              return (
                <div
                  key={exp._id}
                  data-exp-item
                  onClick={() => setActiveIdx(idx)}
                  className="relative cursor-pointer"
                >
                  {/* Glowing 3D Timeline Node */}
                  <span
                    className={`absolute -left-[22px] top-6 flex h-4 w-4 items-center justify-center rounded-full border transition sm:-left-[32px] ${
                      isSelected
                        ? "animate-pulse border-rose-300 bg-rose-500 shadow-[0_0_20px_#f43f5e]"
                        : "border-cyan-300 bg-[#101318] shadow-[0_0_12px_rgba(0,229,255,0.45)]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>

                  <TiltCard3D maxTilt={6} depth={16}>
                    <div
                      className={`glass-panel glass-panel-hover preserve-3d rounded-3xl p-6 transition sm:p-7 ${
                        isSelected ? "border-rose-400/45 shadow-[0_0_32px_rgba(244,63,94,0.16)]" : ""
                      }`}
                    >
                      <div className="depth-z-2 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-cyber text-xs font-bold text-rose-400">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                              {exp.role}
                            </h3>
                            {exp.isCurrent && (
                              <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                                Active Role
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-200">
                              <Briefcase className="h-4 w-4" />
                              {exp.company}
                            </span>
                            {exp.location && (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <MapPin className="h-3.5 w-3.5" />
                                {exp.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-xs text-slate-200">
                          <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                          {dateRange}
                        </div>
                      </div>

                      <p className="depth-z-1 mt-4 text-sm text-slate-300">{exp.description}</p>

                      <ul className="depth-z-1 mt-4 space-y-2 text-sm text-slate-300/90">
                        {exp.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2.5">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="depth-z-1 mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-0.5 text-[11px] font-medium text-cyan-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TiltCard3D>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
