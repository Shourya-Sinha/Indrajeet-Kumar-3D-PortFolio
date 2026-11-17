"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, ExternalLink, Shield, Sparkles } from "lucide-react";
import type { ProjectDoc } from "@/lib/db/types";
import { SectionHeader, StatusPill } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";
import { AttackPathInteractiveSuite } from "@/components/projects/AttackPathInteractiveSuite";

export function ProjectsGallerySection({ projects }: { projects: ProjectDoc[] }) {
  const [showAttackSuite, setShowAttackSuite] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(0);

  if (projects.length === 0) return null;
  const flagship = projects[0];
  const secondary = projects.slice(1);
  const previewProject = secondary[hoveredIdx] || secondary[0];

  return (
    <section id="projects" className="relative py-28 sm:py-36">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Selected Work & Research"
          title="Flagship Software, Local AI & Security Platforms"
          subtitle="Real engineering systems across graph security, private local LLM tooling, deployment automation, real-time media, and enterprise ERP."
        />

        {/* #1 Flagship Showcase: Attack Path Discovery v2.5 */}
        <div className="mt-14 space-y-6">
          <div data-3d-card>
            <TiltCard3D maxTilt={3} depth={14}>
              <div className="glass-panel glass-panel-hover preserve-3d relative rounded-3xl p-6 sm:p-10">
                <div className="preserve-3d grid items-center gap-8 lg:grid-cols-12">
                  <div className="preserve-3d space-y-4 lg:col-span-6">
                    <div className="depth-z-2 flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
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

                    <div className="depth-z-1 grid gap-x-4 gap-y-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                      {flagship.capabilities.slice(0, 8).map((cap) => (
                        <div
                          key={cap}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>

                    {/* Experimental vs Planned */}
                    <div className="depth-z-1 grid gap-4 border-t border-white/10 pt-4 text-xs sm:grid-cols-2">
                      {flagship.experimentalFeatures.length > 0 && (
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-wider text-violet-300">
                            Experimental Modules
                          </div>
                          <ul className="mt-1.5 space-y-1 text-slate-400">
                            {flagship.experimentalFeatures.map((f) => (
                              <li key={f}>· {f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {flagship.plannedFeatures.length > 0 && (
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                            Planned Roadmap
                          </div>
                          <ul className="mt-1.5 space-y-1 text-slate-400">
                            {flagship.plannedFeatures.map((f) => (
                              <li key={f}>· {f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="depth-z-2 flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAttackSuite((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {showAttackSuite ? "Hide 8 Interactive Demos" : "Launch 8 Interactive Demos"}
                      </button>
                      <Link
                        href={`/projects/${flagship.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-white/35"
                      >
                        Full Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <a
                        href={flagship.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-white/35 hover:text-white"
                      >
                        <Code2 className="h-3.5 w-3.5 text-cyan-300" />
                        GitHub
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <TiltCard3D maxTilt={8} depth={22}>
                      <div className="preserve-3d relative overflow-hidden rounded-2xl border border-white/15 bg-[#05070b]">
                        <img
                          src={flagship.imageUrl}
                          alt={flagship.imageAlt}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover transition duration-700 hover:scale-105"
                        />
                        <div className="border-t border-white/10 bg-[#05070b]/90 p-4">
                          <div className="flex flex-wrap gap-2 font-mono text-[11px] text-slate-300">
                            {flagship.technologies.map((t, idx) => (
                              <React.Fragment key={t}>
                                {idx > 0 && <span className="text-slate-600">·</span>}
                                <span>{t}</span>
                              </React.Fragment>
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

        {/* Remaining Flagship Work: Editorial Hover-Reveal Index + Sticky Visual Preview */}
        {secondary.length > 0 && (
          <div className="mt-20 grid items-start gap-10 lg:grid-cols-12">
            {/* Left: Editorial Project Index Rows */}
            <div className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
              {secondary.map((proj, idx) => {
                const isActive = idx === hoveredIdx;
                return (
                  <article
                    key={proj._id}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onFocus={() => setHoveredIdx(idx)}
                    onClick={() => setHoveredIdx(idx)}
                    className={`group cursor-pointer py-6 transition-colors duration-200 ${
                      isActive ? "bg-white/[0.025]" : "hover:bg-white/[0.015]"
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3 px-2 sm:px-4">
                      <div className="flex items-baseline gap-4">
                        <span
                          className={`font-mono text-xs tabular-nums transition ${
                            isActive ? "text-cyan-300" : "text-slate-500"
                          }`}
                        >
                          {String(idx + 2).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-xl font-bold tracking-tight text-white transition group-hover:translate-x-1 sm:text-2xl">
                          {proj.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusPill status={proj.projectStatus} />
                        <span className="font-mono text-xs text-slate-400">
                          ./{proj.version}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-4 px-2 pl-10 sm:px-4 sm:pl-12">
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-300">{proj.category}</span>
                        <span className="mx-2 text-slate-600">—</span>
                        <span>{proj.technologies.slice(0, 4).join(" · ")}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <Link
                          href={`/projects/${proj.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 font-semibold text-cyan-300 transition hover:text-white"
                        >
                          Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-slate-400 transition hover:text-white"
                        >
                          GitHub <ExternalLink className="h-3 w-3" />
                        </a>
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-300 transition hover:text-emerald-200"
                          >
                            Live <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Right: Sticky Hover-Reveal Case Study Preview */}
            {previewProject && (
              <div className="lg:sticky lg:top-28 lg:col-span-5">
                <TiltCard3D maxTilt={7} depth={20}>
                  <div className="glass-panel preserve-3d overflow-hidden rounded-2xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#05070b]">
                      <img
                        src={previewProject.imageUrl}
                        alt={previewProject.imageAlt}
                        className="h-full w-full object-cover transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-transparent" />
                      <div className="depth-z-2 absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-cyan-300">{previewProject.badge}</span>
                        <span className="text-slate-300">{previewProject.version}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-display text-lg font-bold text-white">
                        {previewProject.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {previewProject.summary}
                      </p>

                      <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-xs text-slate-400">
                        {previewProject.capabilities.slice(0, 3).map((c) => (
                          <li key={c} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 flex items-center justify-between">
                        <Link
                          href={`/projects/${previewProject.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                        >
                          Open Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href={previewProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-slate-400 transition hover:text-white"
                        >
                          Source →
                        </a>
                      </div>
                    </div>
                  </div>
                </TiltCard3D>
              </div>
            )}
          </div>
        )}
      </Section3DReveal>
    </section>
  );
}
