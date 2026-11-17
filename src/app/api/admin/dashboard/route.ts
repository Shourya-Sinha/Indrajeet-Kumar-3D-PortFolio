import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { countDocs, findMany, findOne } from "@/lib/db/repository";
import { requireAdmin } from "@/lib/auth/security";
import { getLatestPublishedResume } from "@/lib/resume/service";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const [
    experiencesCount,
    servicesCount,
    projectsCount,
    certificationsCount,
    skillsCount,
    inquiriesCount,
    newInquiriesCount,
    mediaCount,
    versionsCount,
    downloadsCount,
    latestResume,
    pendingDraft,
    recentInquiries,
    recentLogs,
  ] = await Promise.all([
    countDocs("experiences"),
    countDocs("services"),
    countDocs("projects"),
    countDocs("certifications"),
    countDocs("skills"),
    countDocs("contactInquiries"),
    countDocs("contactInquiries", { status: "new" }),
    countDocs("mediaAssets"),
    countDocs("resumeVersions", { profileType: "general" }),
    countDocs("resumeDownloadLogs"),
    getLatestPublishedResume("general"),
    findOne("resumeDrafts", {
      profileType: "general",
      status: { $in: ["pending", "outdated", "validated"] },
    }),
    findMany("contactInquiries", {}, { sort: { createdAt: -1 }, limit: 5 }),
    findMany("auditLogs", {}, { sort: { createdAt: -1 }, limit: 8 }),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      counts: {
        experiences: experiencesCount,
        services: servicesCount,
        projects: projectsCount,
        certifications: certificationsCount,
        skills: skillsCount,
        inquiries: inquiriesCount,
        newInquiries: newInquiriesCount,
        media: mediaCount,
        resumeVersions: versionsCount,
        resumeDownloads: downloadsCount,
      },
      resumeStatus: {
        currentVersion: latestResume?.version || "v1.0",
        hasPendingDraft: Boolean(pendingDraft),
        suggestedVersion: pendingDraft?.suggestedVersion || null,
        draftStatus: pendingDraft?.status || null,
      },
      recentInquiries,
      recentLogs,
    },
  });
}
