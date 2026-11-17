"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import type { ExperienceDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";

gsap.registerPlugin(ScrollTrigger);

export function ExperienceTimelineSection({
  experiences,
}: {
  experiences: ExperienceDoc[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-exp-item]"),
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="Professional Experience"
              title="5+ Years Shipping Production Systems"
              subtitle="Verified career trajectory spanning enterprise workforce platforms, multivendor commerce, React architecture, and security-first API engineering."
            />
          </div>
          <div className="lg:col-span-5">
            <div className="glass-panel overflow-hidden rounded-2xl p-2">
              <img
                src="/assets/visuals/section-experience.webp"
                alt="3D chronological experience helix"
                loading="lazy"
                className="h-36 w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3D Animated Timeline */}
        <div className="relative mt-16 pl-6 sm:pl-10">
          <div className="absolute bottom-2 left-2.5 top-2 w-px bg-gradient-to-b from-cyan-400 via-blue-500/60 to-violet-500/30 sm:left-4" />

          <div className="space-y-8">
            {experiences.map((exp, idx) => {
              const dateRange = exp.startDate
                ? `${exp.startDate} – ${exp.endDate}`
                : exp.endDate;

              return (
                <div key={exp._id} data-exp-item className="relative">
                  {/* Glowing Timeline Node */}
                  <span
                    className={`absolute -left-[22px] top-6 flex h-4 w-4 items-center justify-center rounded-full border sm:-left-[32px] ${
                      exp.isCurrent
                        ? "border-cyan-300 bg-cyan-400 shadow-[0_0_16px_#00e5ff]"
                        : "border-violet-300 bg-[#101318]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>

                  <TiltCard3D maxTilt={4}>
                    <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs text-cyan-300">
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

                      <p className="mt-4 text-sm text-slate-300">{exp.description}</p>

                      <ul className="mt-4 space-y-2 text-sm text-slate-300/90">
                        {exp.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2.5">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300"
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
