"use client";

import React, { useState } from "react";
import { Award, Download, Eye, FileText, ShieldCheck } from "lucide-react";
import type { CertificationDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";
import { CertificateReaderModal } from "@/components/certificates/CertificateReaderModal";

export function CertificationsSection({
  certifications,
}: {
  certifications: CertificationDoc[];
}) {
  const [activeCert, setActiveCert] = useState<CertificationDoc | null>(null);

  return (
    <section id="certifications" className="relative py-24 sm:py-32">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="Verified Certifications"
              title="3D Certificate Exhibition Gallery"
              subtitle="Verified credentials sourced directly from Indrajeet Kumar's professional records with LED-lit 3D museum plaques, page-turn PDF reader, zoom, fullscreen, and original downloads."
            />
          </div>
          <div className="lg:col-span-5">
            <TiltCard3D maxTilt={10} depth={20} floatIdle>
              <div className="holo-border-glow glass-panel overflow-hidden rounded-2xl p-2">
                <img
                  src="/assets/visuals/section-certifications.webp"
                  alt="3D holographic certificate gallery vault"
                  loading="lazy"
                  className="h-36 w-full rounded-xl object-cover"
                />
              </div>
            </TiltCard3D>
          </div>
        </div>

        {/* 3D Architectural Gallery Wall & Illuminated Pedestal Plaques */}
        <div className="relative mt-14 grid gap-10 md:grid-cols-2">
          {certifications.map((cert, idx) => {
            const isCyanTheme = idx % 2 === 0;
            const frameGlow = isCyanTheme
              ? "border-cyan-400/50 shadow-[0_0_40px_rgba(0,229,255,0.22),inset_0_0_24px_rgba(0,229,255,0.08)]"
              : "border-amber-400/45 shadow-[0_0_40px_rgba(245,158,11,0.18),inset_0_0_24px_rgba(147,51,234,0.1)]";
            const accentBadge = isCyanTheme
              ? "border-cyan-400/40 bg-cyan-400/12 text-cyan-300"
              : "border-amber-400/40 bg-amber-400/12 text-amber-300";

            return (
              <div key={cert._id} data-3d-card className="flex flex-col items-center">
                <TiltCard3D maxTilt={11} depth={24} className="w-full">
                  <div
                    className={`glass-panel glass-panel-hover preserve-3d group relative rounded-3xl border p-2 ${frameGlow}`}
                  >
                    {/* Top Illuminated LED Strip */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-10 -top-px h-[2px] rounded-full blur-[0.5px] ${
                        isCyanTheme
                          ? "bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                          : "bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                      }`}
                    />

                    {/* Inner Metallic 3D Exhibition Frame */}
                    <div className="preserve-3d rounded-[20px] border border-white/15 bg-gradient-to-br from-[#121826] via-[#090c14] to-[#05070c] p-6 sm:p-8">
                      <div className="depth-z-2 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${accentBadge}`}
                          >
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <span
                              className={`font-cyber text-[10px] font-bold uppercase tracking-[0.22em] ${
                                isCyanTheme ? "text-cyan-300" : "text-amber-300"
                              }`}
                            >
                              Exhibit {String(idx + 1).padStart(2, "0")} · Verified
                            </span>
                            <h3 className="mt-0.5 font-display text-xl font-bold text-white sm:text-2xl">
                              {cert.title}
                            </h3>
                          </div>
                        </div>

                        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300">
                          {cert.issueDate}
                        </span>
                      </div>

                      {/* Floating 3D Paper Presentation Plaque */}
                      <div
                        onClick={() => setActiveCert(cert)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setActiveCert(cert);
                        }}
                        className="depth-z-2 mt-6 cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#05070b]/95 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.72)] transition duration-500 group-hover:border-cyan-400/50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-200">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            {cert.issuer}
                            {cert.location ? ` · ${cert.location}` : ""}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300">
                            <FileText className="h-3.5 w-3.5 text-cyan-300" />
                            {cert.hasOriginalDocument
                              ? "Original Document Attached"
                              : "Verified Credential Summary"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {cert.description}
                        </p>
                      </div>

                      <div className="depth-z-3 mt-6 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveCert(cert)}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ring-1 transition hover:-translate-y-0.5 ${
                            isCyanTheme
                              ? "bg-cyan-400/15 text-cyan-200 ring-cyan-400/40 shadow-[0_4px_16px_rgba(0,229,255,0.2)] hover:bg-cyan-400/25"
                              : "bg-amber-400/15 text-amber-200 ring-amber-400/40 shadow-[0_4px_16px_rgba(245,158,11,0.2)] hover:bg-amber-400/25"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Open 3D Document Reader
                        </button>

                        {cert.documentUrl ? (
                          <a
                            href={cert.documentUrl}
                            download
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                          >
                            <Download className="h-3.5 w-3.5 text-cyan-300" />
                            Download Original
                          </a>
                        ) : (
                          <span className="font-mono text-[11px] text-slate-500">
                            Original scan ready in Admin CMS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard3D>

                {/* Architectural 3D Museum Pedestal Shadow Base */}
                <div
                  aria-hidden="true"
                  className={`mt-3 h-2 w-4/5 rounded-full blur-md ${
                    isCyanTheme ? "bg-cyan-400/25" : "bg-amber-400/20"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </Section3DReveal>

      <CertificateReaderModal cert={activeCert} onClose={() => setActiveCert(null)} />
    </section>
  );
}
