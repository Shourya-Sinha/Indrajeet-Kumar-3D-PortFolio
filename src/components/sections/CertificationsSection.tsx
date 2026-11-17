"use client";

import React, { useState } from "react";
import { Award, Download, Eye, FileText } from "lucide-react";
import type { CertificationDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { CertificateReaderModal } from "@/components/certificates/CertificateReaderModal";

export function CertificationsSection({
  certifications,
}: {
  certifications: CertificationDoc[];
}) {
  const [activeCert, setActiveCert] = useState<CertificationDoc | null>(null);

  return (
    <section id="certifications" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Verified Certifications"
          title="3D Certificate Exhibition Gallery"
          subtitle="Verified credentials sourced directly from professional records with interactive 3D frames, PDF reader, page-turn viewer, zoom, fullscreen, and original downloads."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {certifications.map((cert, idx) => (
            <TiltCard3D key={cert._id} maxTilt={7}>
              <div className="glass-panel glass-panel-hover group relative overflow-hidden rounded-3xl border border-white/15 p-1.5">
                {/* Metallic Outer Certificate Frame */}
                <div className="rounded-[20px] border border-cyan-400/20 bg-gradient-to-br from-[#131924] via-[#0b0e14] to-[#07090d] p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-400/10 text-cyan-300">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                          Credential {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-xl font-bold text-white">
                          {cert.title}
                        </h3>
                      </div>
                    </div>

                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-slate-300">
                      {cert.issueDate}
                    </span>
                  </div>

                  {/* 3D Paper Presentation Preview */}
                  <div
                    onClick={() => setActiveCert(cert)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveCert(cert);
                    }}
                    className="mt-6 cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#06080c] p-5 transition duration-500 group-hover:border-cyan-400/40"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-cyan-200">
                        {cert.issuer}
                        {cert.location ? ` · ${cert.location}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                        <FileText className="h-3.5 w-3.5 text-cyan-300" />
                        {cert.hasOriginalDocument ? "Original Document Attached" : "Verified Credential Summary"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {cert.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveCert(cert)}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-4 py-2 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/35 transition hover:bg-cyan-400/25"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Open 3D Document Reader
                    </button>

                    {cert.documentUrl ? (
                      <a
                        href={cert.documentUrl}
                        download
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-cyan-400/40"
                      >
                        <Download className="h-3.5 w-3.5 text-cyan-300" />
                        Download Original
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Upload original scan in Admin CMS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </div>

      <CertificateReaderModal cert={activeCert} onClose={() => setActiveCert(null)} />
    </section>
  );
}
