import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany, findOne } from "@/lib/db/repository";
import { getLatestPublishedResume } from "@/lib/resume/service";
import type { ResumeProfileType } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const profileParam = (req.nextUrl.searchParams.get("profile") || "general") as ResumeProfileType;
  const latest = await getLatestPublishedResume(profileParam);
  if (!latest) {
    return NextResponse.json(
      { ok: false, error: `No published resume found for profile ${profileParam}.` },
      { status: 404 }
    );
  }
  const settings = await findOne("resumeSettings", { settingsKey: "primary" });
  const allRoleLatest = await findMany("resumeVersions", {
    isLatest: true,
    isPublic: true,
    status: "published",
  });

  return NextResponse.json({
    ok: true,
    data: {
      latest,
      enabledProfiles: settings?.enabledRoleProfiles || ["general"],
      roleProfilesLatest: allRoleLatest.map((v) => ({
        profileType: v.profileType,
        version: v.version,
        title: v.title,
        publishedAt: v.publishedAt,
        pdfUrl: v.pdfUrl,
        docxUrl: v.docxUrl,
      })),
    },
  });
}
