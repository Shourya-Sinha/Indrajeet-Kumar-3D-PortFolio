"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, ExternalLink, Layers, Shield, Sparkles } from "lucide-react";
import type { ProjectDoc } from "@/lib/db/types";
import { SectionHeader, StatusPill } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";
import { AttackPathInteractiveSuite } from "@/components/projects/AttackPathInteractiveSuite";

export function ProjectsGallerySection({ projects }: { projects: ProjectDoc[] }) {
  const [showAttackSuite, setShowAttackSuite] = useState(true);

  if (projects.length === 0) return null;
  const flagship = projects[0];
  const secondary = projects.slice(1);

  return (
    <section id="projects" className="relative py-24 sm:py-32">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Featured Product & Research Showcase"
          title="Flagship Software, Local AI & Security Platforms"
          subtitle="Real engineering systems across offensive/defensive graph security, private local LLM tooling, deployment infrastructure, real-time media, and enterprise ERP."
        />

        {/* #1 Flagship Showcase: Attack Path Discovery v2.5 */}
        <div className="mt-14 space-y-6">
          <div data-3d-card>
            <TiltCard3D maxTilt={4} depth={16}>
              <div className="glass-panel glass-panel-hover preserve-3d relative rounded-3xl border border-cyan-400/30 p-6 sm:p-10">
                <div className="preserve-3d grid items-center gap-8 lg:grid-cols-12">
                  <div className="preserve-3d space-y-4 lg:col-span-6">
                    <div className="depth-z-2 flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-200 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                        <Shield className="h-3.5 w-3.5" />
                        {flagship.badge} · {flagship.version}
                      </span>
                      <StatusPill status={flagship.projectStatus} />
                    </div>

                    <h3 className="depth-z-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                      {flagship.title}
                    </h3>

                    <p className="depth-z-1 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {flagship.fullDescription}
                    </p>

                    <div className="depth-z-1 grid gap-2 pt-2 sm:grid-cols-2">
                      {flagship.capabilities.slice(0, 8).map((cap) => (
                        <div
                          key={cap}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-400/35"
                        >
                          {cap}
                        </div>
                      ))}
                    </div>

                    {/* Clear separation of Experimental vs Planned */}
                    <div className="depth-z-1 grid gap-3 pt-2 text-xs sm:grid-cols-2">
                      {flagship.experimentalFeatures.length > 0 && (
                        <div className="rounded-xl border border-violet-400/25 bg-violet-400/[0.06] p-3">
                          <div className="font-semibold text-violet-300">Experimental Modules</div>
                          <ul className="mt-1 space-y-1 text-slate-300">
                            {flagship.experimentalFeatures.map((f) => (
                              <li key={f}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {flagship.plannedFeatures.length > 0 && (
                        <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3">
                          <div className="font-semibold text-slate-200">Planned Roadmap</div>
                          <ul className="mt-1 space-y-1 text-slate-400">
                            {flagship.plannedFeatures.map((f) => (
                              <li key={f}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="depth-z-2 flex flex-wrap gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAttackSuite((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_4px_0_rgba(14,116,144,0.7),0_0_24px_rgba(0,229,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {showAttackSuite ? "Hide 8 Interactive Demos" : "Launch 8 Interactive Demos"}
                      </button>
                      <Link
                        href={`/projects/${flagship.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                      >
                        Full Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <a
                        href={flagship.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40"
                      >
                        <Code2 className="h-3.5 w-3.5 text-cyan-300" />
                        GitHub Repository
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <TiltCard3D maxTilt={10} depth={26}>
                      <div className="preserve-3d relative overflow-hidden rounded-2xl border border-white/20 bg-[#07090e] shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
                        <img
                          src={flagship.imageUrl}
                          alt={flagship.imageAlt}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover transition duration-700 hover:scale-105"
                        />
                        <div className="border-t border-white/10 bg-black/60 p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {flagship.technologies.map((t) => (
                              <span
                                key={t}
                                className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TiltCard3D>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {showAttackSuite && flagship.interactiveDemoKey === "attack-path-v25" && (
            <AttackPathInteractiveSuite />
          )}
        </div>

        {/* Remaining 7+ Featured Product Showcases */}
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {secondary.map((proj) => (
            <div key={proj._id} data-3d-card>
              <TiltCard3D maxTilt={9} depth={22}>
                <article className="glass-panel glass-panel-hover preserve-3d flex h-full flex-col rounded-3xl">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl bg-[#07090d]">
                    <img
                      src={proj.imageUrl}
                      alt={proj.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent" />
                  </div>

                  {/* Floating 3D Badges elevated on Z axis */}
                  <div className="depth-z-3 pointer-events-none absolute left-4 top-4 flex items-center gap-2">
                    <span className="rounded-full border border-white/25 bg-black/70 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                      {proj.badge}
                    </span>
                    <StatusPill status={proj.projectStatus} />
                  </div>

                  <div className="preserve-3d flex flex-1 flex-col justify-between p-6">
                    <div className="preserve-3d">
                      <div className="depth-z-1 flex items-center justify-between text-xs text-cyan-300">
                        <span>{proj.category}</span>
                        <span className="font-mono">{proj.version}</span>
                      </div>
                      <h3 className="depth-z-2 mt-2 font-display text-xl font-bold text-white">
                        {proj.title}
                      </h3>
                      <p className="depth-z-1 mt-2 text-sm leading-relaxed text-slate-300">
                        {proj.summary}
                      </p>

                      <ul className="mt-4 space-y-1.5 text-xs text-slate-300/90">
                        {proj.capabilities.slice(0, 4).map((c) => (
                          <li key={c} className="flex items-start gap-2">
                            <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="depth-z-2 mt-6 space-y-4 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.slice(0, 6).map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/projects/${proj.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-4 py-2 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/35 transition hover:-translate-y-0.5 hover:bg-cyan-400/25"
                        >
                          Architecture & Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white"
                        >
                          GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200"
                          >
                            Live Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </TiltCard3D>
            </div>
          ))}
        </div>
      </Section3DReveal>
    </section>
  );
}
