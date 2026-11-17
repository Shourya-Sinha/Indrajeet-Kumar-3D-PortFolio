"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { SkillDoc } from "@/lib/db/types";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Technical Expertise"
          title="Full-Spectrum Engineering & Security Stack"
          subtitle="Interactive 3D skill clusters synchronized with the centralized professional database."
        />

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-12">
          {/* Interactive 3D Skill Orbital Canvas */}
          <div className="glass-panel relative min-h-[360px] overflow-hidden rounded-3xl lg:col-span-5">
            <ExpertiseCanvas categories={categories} activeCategory={activeCategory} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050608] via-[#050608]/75 to-transparent p-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">
                Active Domain Cluster
              </div>
              <div className="font-display text-xl font-bold text-white">{activeCategory}</div>
            </div>
          </div>

          {/* Domain Tabs & Skills Grid */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_rgba(0,229,255,0.18)]"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {filteredSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="glass-panel glass-panel-hover rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-bold text-white">
                      {skill.name}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-cyan-300">
                      {skill.experienceYears}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{skill.description || skill.category}</span>
                    <span className="font-mono text-slate-300">{skill.proficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
