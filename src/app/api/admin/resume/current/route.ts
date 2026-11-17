import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { countDocs, findMany, findOne } from "@/lib/db/repository";
import { requireAdmin } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";
import { buildResumeSnapshot, ROLE_PROFILE_META } from "@/lib/resume/role-profiles";
import { computeSnapshotHash, diffResumeSnapshots } from "@/lib/resume/hash";
import { getLatestPublishedResume } from "@/lib/resume/service";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const profileType = (req.nextUrl.searchParams.get("profile") || "general") as ResumeProfileType;
  const [latestPublished, activeDraft, versions, settings, totalDownloads, liveSnapshot] =
    await Promise.all([
      getLatestPublishedResume(profileType),
      findOne("resumeDrafts", {
        profileType,
        status: { $in: ["pending", "outdated", "validated"] },
      }),
      findMany(
        "resumeVersions",
        { profileType },
        { sort: { major: -1, minor: -1, patch: -1 } }
      ),
      findOne("resumeSettings", { settingsKey: "primary" }),
      countDocs("resumeDownloadLogs", { profileType }),
      buildResumeSnapshot(profileType),
    ]);

  const liveHash = computeSnapshotHash(liveSnapshot);
  const isOutdated = Boolean(latestPublished && latestPublished.contentHash !== liveHash);
  const pendingDiff =
    latestPublished && isOutdated
      ? diffResumeSnapshots(latestPublished.profileSnapshot, liveSnapshot)
      : { added: [], modified: [], removed: [], totalChanges: 0 };

  return NextResponse.json({
    ok: true,
    data: {
      profileType,
      profileMeta: ROLE_PROFILE_META[profileType],
      allProfiles: ROLE_PROFILE_META,
      latestPublished,
      activeDraft,
      isOutdated,
      liveHash,
      pendingDiff,
      versionCount: versions.length,
      totalDownloads,
      settings,
    },
  });
}
