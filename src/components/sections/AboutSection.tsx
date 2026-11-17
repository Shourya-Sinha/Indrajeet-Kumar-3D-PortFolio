"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Download, GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import type { AboutContentDoc, ProfessionalProfileDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";

export function AboutSection({
  about,
  profile,
  latestVersion,
}: {
  about: AboutContentDoc;
  profile: ProfessionalProfileDoc;
  latestVersion?: string;
}) {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About Indrajeet Kumar (Shourya Sinha)"
          title={about.headline}
          subtitle={about.educationHighlight}
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
          {/* 3D Depth Visual Monolith */}
          <div data-3d-card className="lg:col-span-5">
            <TiltCard3D maxTilt={11} depth={24} floatIdle glowAccent="cyan">
              <div className="glass-panel glass-panel-hover preserve-3d relative rounded-3xl p-3">
                <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-[#07090d]">
                  <img
                    src={about.profileImageUrl}
                    alt={about.profileImageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
                </div>
                <div className="depth-z-2 pointer-events-none absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs text-slate-200 shadow-lg backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                    {profile.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-200 shadow-lg backdrop-blur-md">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {about.yearsExperience}
                  </span>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Floating 3D Glass Biography & Verified Metrics */}
          <div className="space-y-6 lg:col-span-7">
            <div data-3d-card>
              <TiltCard3D maxTilt={5} depth={16}>
                <div className="glass-panel glass-panel-hover preserve-3d rounded-3xl p-6 sm:p-8">
                  <p className="depth-z-1 text-base leading-relaxed text-slate-200">
                    {profile.summary || about.summary}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{about.careerGoals}</p>

                  <div className="depth-z-1 mt-6 grid gap-2.5 sm:grid-cols-2">
                    {about.specialties.map((spec) => (
                      <div
                        key={spec}
                        className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-200 transition hover:border-cyan-400/35"
                      >
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="depth-z-2 mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                    <a
                      href={`/api/public/resume/download/${encodeURIComponent(latestVersion || "v1.0")}/pdf`}
                      download
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_4px_0_rgba(14,116,144,0.7)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Resume ({latestVersion || "v1.0"})
                    </a>
                    <Link
                      href="/resume"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                    >
                      Open Resume Archive <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </TiltCard3D>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {about.stats.map((st) => (
                <div key={st.label} data-3d-card>
                  <TiltCard3D maxTilt={13} depth={22}>
                    <div className="glass-panel glass-panel-hover preserve-3d h-full rounded-2xl p-4">
                      <div className="depth-z-2 font-display text-2xl font-bold text-cyan-300">
                        {st.value}
                      </div>
                      <div className="depth-z-1 mt-1 text-xs font-semibold text-white">
                        {st.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{st.note}</div>
                    </div>
                  </TiltCard3D>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section3DReveal>
    </section>
  );
}
