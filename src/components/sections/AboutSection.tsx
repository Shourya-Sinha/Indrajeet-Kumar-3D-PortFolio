"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, GraduationCap, Lock, MapPin, ShieldCheck, Unlock } from "lucide-react";
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
  const [dossierClicks, setDossierClicks] = useState(0);

  return (
    <section id="about" className="relative py-28 sm:py-36">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About · Indrajeet Kumar (Shourya Sinha)"
          title={about.headline}
          subtitle={about.educationHighlight}
        />

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-12">
          {/* Left: Clean Sculptural Visual Monolith */}
          <div data-3d-card className="lg:col-span-5">
            <TiltCard3D maxTilt={8} depth={18} glowAccent="cyan">
              <div className="glass-panel glass-panel-hover preserve-3d relative rounded-2xl p-2">
                <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-[#05070b]">
                  <img
                    src={about.profileImageUrl}
                    alt={about.profileImageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040508]/90 via-transparent to-transparent" />
                </div>
                <div className="depth-z-2 flex flex-wrap items-center justify-between gap-2 px-3 py-3 font-mono text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                    {profile.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-cyan-300">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {about.yearsExperience}
                  </span>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Right: Editorial Biography + Hairline Metrics + Playful AppSec Dossier */}
          <div className="space-y-8 lg:col-span-7">
            <div data-3d-card className="space-y-5">
              <p className="text-lg leading-relaxed text-slate-200 sm:text-xl">
                {profile.summary || about.summary}
              </p>
              <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
                {about.careerGoals}
              </p>

              {/* Minimal Hairline Specialty List */}
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                {about.specialties.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-start gap-2.5 border-l border-white/15 pl-3.5 text-xs text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              {/* Action Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href={`/api/public/resume/download/${encodeURIComponent(latestVersion || "v1.0")}/pdf`}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Resume ({latestVersion || "v1.0"})
                </a>
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-white/35 hover:text-white"
                >
                  Resume Archive <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Playful Interactive AppSec Secret Dossier */}
            <div data-3d-card className="border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setDossierClicks((c) => c + 1)}
                className="group flex w-full items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-left font-mono text-xs transition hover:border-cyan-400/40 hover:bg-white/[0.04]"
              >
                <span className="inline-flex items-center gap-2.5 text-slate-300 group-hover:text-white">
                  {dossierClicks === 0 ? (
                    <Lock className="h-3.5 w-3.5 text-rose-400" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span className="tracking-[0.14em]">
                    CONFIDENTIAL/2026 · DO_NOT_OPEN.ENC
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 group-hover:text-cyan-300">
                  {dossierClicks === 0 ? "Inspect" : dossierClicks === 1 ? "Clicked 1×" : `Clearance ×${dossierClicks}`}
                </span>
              </button>

              {dossierClicks > 0 && (
                <div className="mt-3 rounded-xl border border-white/10 bg-[#070a10] p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {dossierClicks === 1 ? (
                    <p>
                      <span className="text-rose-400">Didn&apos;t you read the clearance tag?</span>{" "}
                      One time, I&apos;ll let it slide. Everything on this portfolio runs on a real Next.js CMS,
                      a custom ATS PDF/DOCX engine, and zero ad trackers. Don&apos;t open it twice.
                    </p>
                  ) : (
                    <p>
                      <span className="text-cyan-300">Opened twice — you definitely belong in AppSec.</span>{" "}
                      Check out <span className="text-white">Attack Path Discovery v2.5</span> below or send
                      an architecture challenge directly via <span className="text-white">support@anantainfratechsolutions.com</span>.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Clean Hairline Editorial Stats (No Box Clutter) */}
            <div
              data-3d-card
              className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4"
            >
              {about.stats.map((st) => (
                <div key={st.label}>
                  <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                    {st.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-cyan-300">
                    {st.label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{st.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section3DReveal>
    </section>
  );
}
