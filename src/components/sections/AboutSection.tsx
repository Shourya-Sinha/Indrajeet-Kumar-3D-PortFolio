"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Download, GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import type { AboutContentDoc, ProfessionalProfileDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About Shourya Sinha"
          title={about.headline}
          subtitle={about.educationHighlight}
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
          {/* 3D Depth Visual Monolith */}
          <div className="lg:col-span-5">
            <TiltCard3D maxTilt={6}>
              <div className="glass-panel relative overflow-hidden rounded-3xl p-3">
                <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-[#07090d]">
                  <img
                    src={about.profileImageUrl}
                    alt={about.profileImageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-slate-200 backdrop-blur-md">
                      <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                      {profile.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur-md">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {about.yearsExperience}
                    </span>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Floating Glass Biography & Verified Metrics */}
          <div className="space-y-6 lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <p className="text-base leading-relaxed text-slate-200">{profile.summary || about.summary}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{about.careerGoals}</p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {about.specialties.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-2.5 text-xs text-slate-200"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <a
                  href={`/api/public/resume/download/${encodeURIComponent(latestVersion || "v1.0")}/pdf`}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Resume ({latestVersion || "v1.0"})
                </a>
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40"
                >
                  Open Resume Archive <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {about.stats.map((st) => (
                <div key={st.label} className="glass-panel rounded-2xl p-4">
                  <div className="font-display text-2xl font-bold text-cyan-300">{st.value}</div>
                  <div className="mt-1 text-xs font-semibold text-white">{st.label}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{st.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
