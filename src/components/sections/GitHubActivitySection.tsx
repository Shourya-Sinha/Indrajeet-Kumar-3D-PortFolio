import React from "react";
import { Code2, ExternalLink, FolderGit2, GitBranch } from "lucide-react";
import type { GitHubActivityPayload } from "@/lib/github/client";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";

export function GitHubActivitySection({ github }: { github: GitHubActivityPayload }) {
  return (
    <section id="github" className="relative py-24 sm:py-32">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Open Source & Engineering Velocity"
            title="Live GitHub Repository Telemetry"
            subtitle={`Public repositories fetched directly from github.com/${github.username} with intelligent caching and zero fabricated metrics.`}
          />

          <a
            href={github.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-5 py-2.5 text-xs font-semibold text-cyan-200 shadow-[0_4px_0_rgba(14,116,144,0.35)] transition hover:-translate-y-0.5 hover:bg-cyan-400/20"
          >
            <GitBranch className="h-4 w-4" />
            @{github.username} ({github.publicReposCount} Public Repos)
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Language Breakdown Strip */}
        <div data-3d-card className="mt-8 flex flex-wrap gap-2.5">
          {github.languageBreakdown.map((item) => (
            <div
              key={item.language}
              className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs transition hover:-translate-y-0.5 hover:border-cyan-400/40"
            >
              <Code2 className="h-3.5 w-3.5 text-cyan-300" />
              <span className="font-semibold text-white">{item.language}</span>
              <span className="font-mono text-slate-400">{item.count} repos</span>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {github.repositories.slice(0, 9).map((repo) => (
            <div key={repo.name} data-3d-card>
              <TiltCard3D maxTilt={11} depth={22}>
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel glass-panel-hover preserve-3d flex h-full flex-col justify-between rounded-2xl p-5"
                >
                  <div className="preserve-3d">
                    <div className="depth-z-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <FolderGit2 className="h-4 w-4 shrink-0" />
                        <span className="truncate font-display text-sm font-bold text-white">
                          {repo.name}
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </div>
                    <p className="depth-z-1 mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {repo.description}
                    </p>
                  </div>

                  <div className="depth-z-1 mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400">
                    <span className="font-medium text-cyan-200">
                      {repo.language || "Multi-Stack"}
                    </span>
                    <span>
                      Updated{" "}
                      {new Date(repo.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </a>
              </TiltCard3D>
            </div>
          ))}
        </div>
      </Section3DReveal>
    </section>
  );
}
