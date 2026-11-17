"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SkillDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Section3DReveal } from "@/components/ui/Section3DReveal";

const ExpertiseCanvas = dynamic(
  () => import("@/components/three/ExpertiseCanvas").then((m) => m.ExpertiseCanvas),
  { ssr: false }
);

export function ExpertiseSection({ skills }: { skills: SkillDoc[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const s of skills) {
      if (!seen.includes(s.category)) seen.push(s.category);
    }
    return seen;
  }, [skills]);

  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || "Frontend Engineering");
  const filteredSkills = useMemo(
    () => skills.filter((s) => s.category === activeCategory),
    [skills, activeCategory]
  );

  return (
    <section id="expertise" className="relative py-24 sm:py-32">
      <Section3DReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Technical Expertise"
          title="Full-Spectrum Engineering & Security Stack"
          subtitle="Interactive 3D skill clusters synchronized with the centralized professional database."
        />

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-12">
          {/* Interactive 3D Skill Orbital Canvas */}
          <div data-3d-card className="lg:col-span-5">
            <TiltCard3D maxTilt={8} depth={20} className="h-full">
              <div className="glass-panel glass-panel-hover preserve-3d relative min-h-[380px] h-full overflow-hidden rounded-3xl">
                <ExpertiseCanvas categories={categories} activeCategory={activeCategory} />
                <div className="depth-z-2 pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050608] via-[#050608]/80 to-transparent p-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                    Active 3D Domain Cluster
                  </div>
                  <div className="font-display text-xl font-bold text-white">{activeCategory}</div>
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Domain Tabs & 3D Flip-In Skills Grid */}
          <div className="space-y-6 lg:col-span-7">
            <div data-3d-card className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition duration-300 ${
                      active
                        ? "border-cyan-400/65 bg-cyan-400/15 text-cyan-200 shadow-[0_4px_0_rgba(0,229,255,0.22),0_0_24px_rgba(0,229,255,0.2)] -translate-y-0.5"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:-translate-y-0.5 hover:border-cyan-400/35"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div key={activeCategory} className="grid gap-3.5 sm:grid-cols-2">
              {filteredSkills.map((skill, idx) => (
                <div
                  key={skill._id}
                  data-3d-card
                  className="animate-3d-flip"
                  style={{ animationDelay: `${idx * 45}ms` }}
                >
                  <TiltCard3D maxTilt={11} depth={20}>
                    <div className="glass-panel glass-panel-hover preserve-3d rounded-2xl p-4">
                      <div className="depth-z-2 flex items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-white">
                          {skill.name}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-cyan-300">
                          {skill.experienceYears}
                        </span>
                      </div>
                      <div className="depth-z-1 mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(0,229,255,0.65)] transition-all duration-500"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{skill.description || skill.category}</span>
                        <span className="font-mono text-slate-300">{skill.proficiency}%</span>
                      </div>
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
