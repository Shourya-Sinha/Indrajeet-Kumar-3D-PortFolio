import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { requireAdmin } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";
import { buildResumeSnapshot } from "@/lib/resume/role-profiles";
import { computeSnapshotHash, diffResumeSnapshots, inferBumpType, bumpSemver } from "@/lib/resume/hash";
import { getLatestPublishedResume } from "@/lib/resume/service";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const profileType = (req.nextUrl.searchParams.get("profile") || "general") as ResumeProfileType;
  const latest = await getLatestPublishedResume(profileType);
  const live = await buildResumeSnapshot(profileType);
  const liveHash = computeSnapshotHash(live);

  if (!latest) {
    return NextResponse.json({
      ok: true,
      data: {
        hasChanges: true,
        fromVersion: "v0.0",
        suggestedVersion: "v1.0",
        diff: { added: ["Initial release"], modified: [], removed: [], totalChanges: 1 },
      },
    });
  }

  const diff = diffResumeSnapshots(latest.profileSnapshot, live);
  const hasChanges = latest.contentHash !== liveHash;
  const bump = inferBumpType(diff);
  const next = bumpSemver(latest.version, bump);

  return NextResponse.json({
    ok: true,
    data: {
      hasChanges,
      fromVersion: latest.version,
      suggestedVersion: hasChanges ? next.version : latest.version,
      bumpType: bump,
      diff,
    },
  });
}
