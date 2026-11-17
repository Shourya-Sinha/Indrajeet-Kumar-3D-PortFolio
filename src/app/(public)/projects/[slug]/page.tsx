import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Code2, ExternalLink, Layers } from "lucide-react";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany, findOne } from "@/lib/db/repository";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StatusPill } from "@/components/ui/SectionHeader";
import { AttackPathInteractiveSuite } from "@/components/projects/AttackPathInteractiveSuite";
import { getLatestPublishedResume } from "@/lib/resume/service";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureDatabaseSeeded();
  const { slug } = await params;

  const [project, settings, navigation, latestResume] = await Promise.all([
    findOne("projects", { slug, status: "published", includeInPortfolio: true }),
    findOne("siteSettings", { settingsKey: "primary" }),
    findMany("navigationItems", { isVisible: true }, { sort: { order: 1 } }),
    getLatestPublishedResume("general"),
  ]);

  if (!project || !settings) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ambient-grid">
      <Navbar
        settings={settings}
        navigation={navigation}
        latestResumeVersion={latestResume?.version || "v1.0"}
      />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Featured Projects
        </Link>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                {project.badge} · {project.version}
              </span>
              <StatusPill status={project.projectStatus} />
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {project.title}
            </h1>

            <p className="text-base leading-relaxed text-slate-300">
              {project.fullDescription}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300"
              >
                <Code2 className="h-4 w-4" />
                Inspect Source on GitHub
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:border-cyan-400/40"
                >
                  Open Public Link <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass-panel overflow-hidden rounded-3xl p-2">
              <img
                src={project.imageUrl}
                alt={project.imageAlt}
                className="aspect-[16/10] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* Capabilities & Architecture Modules */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 lg:col-span-7">
            <h2 className="font-display text-xl font-bold text-white">
              Verified Engineering Capabilities
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-200">
              {project.capabilities.map((cap) => (
                <li key={cap} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="glass-panel rounded-3xl p-6">
              <h2 className="font-display text-lg font-bold text-white">
                Core Architecture Modules
              </h2>
              <div className="mt-3 space-y-2">
                {project.architectureModules.map((mod) => (
                  <div
                    key={mod}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-cyan-200"
                  >
                    <Layers className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <h2 className="font-display text-lg font-bold text-white">Technology Stack</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(project.experimentalFeatures.length > 0 || project.plannedFeatures.length > 0) && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {project.experimentalFeatures.length > 0 && (
              <div className="glass-panel rounded-3xl border border-violet-400/25 p-6">
                <h3 className="font-display text-base font-bold text-violet-300">
                  Experimental Capabilities
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {project.experimentalFeatures.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.plannedFeatures.length > 0 && (
              <div className="glass-panel rounded-3xl p-6">
                <h3 className="font-display text-base font-bold text-slate-200">
                  Planned Enhancements
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  {project.plannedFeatures.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {project.interactiveDemoKey === "attack-path-v25" && (
          <div className="mt-12">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Interactive v2.5 Architecture Simulators
            </h2>
            <AttackPathInteractiveSuite />
          </div>
        )}
      </main>

      <Footer settings={settings} navigation={navigation} />
    </div>
  );
}
