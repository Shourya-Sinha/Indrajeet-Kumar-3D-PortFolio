import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany, findOne } from "@/lib/db/repository";
import type { ResumeProfileType, ResumeVersionDoc } from "@/lib/db/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PublicResumeCenterClient } from "@/components/resume/PublicResumeCenterClient";
import { getLatestPublishedResume } from "@/lib/resume/service";

export const dynamic = "force-dynamic";

export default async function PublicResumePage() {
  await ensureDatabaseSeeded();
  const [settings, navigation, resumeSettings, allPublished, latestGeneral] = await Promise.all([
    findOne("siteSettings", { settingsKey: "primary" }),
    findMany("navigationItems", { isVisible: true }, { sort: { order: 1 } }),
    findOne("resumeSettings", { settingsKey: "primary" }),
    findMany(
      "resumeVersions",
      { isPublic: true, status: "published" },
      { sort: { major: -1, minor: -1, patch: -1 } }
    ),
    getLatestPublishedResume("general"),
  ]);

  const enabledProfiles = (resumeSettings?.enabledRoleProfiles || [
    "general",
    "fullstack",
    "mobile",
    "python-ai",
    "cybersecurity",
    "it-support",
  ]) as ResumeProfileType[];

  const versionsByProfile: Record<string, ResumeVersionDoc[]> = {};
  for (const prof of enabledProfiles) {
    versionsByProfile[prof] = allPublished.filter((v) => v.profileType === prof);
  }

  return (
    <div className="min-h-screen bg-ambient-grid">
      <Navbar
        settings={settings!}
        navigation={navigation}
        latestResumeVersion={latestGeneral?.version || "v1.0"}
      />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to 3D Portfolio
          </Link>
        </div>

        <PublicResumeCenterClient
          versionsByProfile={versionsByProfile}
          enabledProfiles={enabledProfiles}
        />
      </main>

      <Footer settings={settings!} navigation={navigation} />
    </div>
  );
}
