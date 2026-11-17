import React from "react";
import { GraduationCap } from "lucide-react";
import type { EducationDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";

export function EducationSection({ education }: { education: EducationDoc[] }) {
  return (
    <section id="education" className="relative py-24 sm:py-32">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <SectionHeader
              eyebrow="Academic Foundation"
              title="Computer Science & Cybersecurity Studies"
              subtitle="Combining foundational software systems education with specialized graduate cybersecurity engineering."
            />
            <div data-3d-card>
              <TiltCard3D maxTilt={10} depth={22} floatIdle glowAccent="violet">
                <div className="glass-panel glass-panel-hover overflow-hidden rounded-3xl p-2">
                  <img
                    src="/assets/visuals/section-education.webp"
                    alt="3D geometric knowledge lattice"
                    loading="lazy"
                    className="aspect-[16/10] w-full rounded-2xl object-cover transition duration-700 hover:scale-105"
                  />
                </div>
              </TiltCard3D>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-7">
            {education.map((ed) => {
              const dates = ed.startDate ? `${ed.startDate} – ${ed.endDate}` : ed.endDate;
              return (
                <div key={ed._id} data-3d-card>
                  <TiltCard3D maxTilt={9} depth={20} glowAccent="violet">
                    <div className="glass-panel glass-panel-hover preserve-3d rounded-3xl p-6 sm:p-8">
                      <div className="depth-z-2 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-400/10 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.22)]">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                              {ed.degree}
                            </h3>
                            <div className="mt-1 text-sm font-semibold text-cyan-300">
                              {ed.institution}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-400">{ed.location}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-slate-200">
                            {dates}
                          </span>
                          {ed.gpa && (
                            <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-0.5 font-mono text-xs font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                              GPA: {ed.gpa}
                            </span>
                          )}
                        </div>
                      </div>

                      {ed.highlights.length > 0 && (
                        <ul className="depth-z-1 mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
                          {ed.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2.5">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </TiltCard3D>
                </div>
              );
            })}
          </div>
        </div>
      </Section3DReveal>
    </section>
  );
}
