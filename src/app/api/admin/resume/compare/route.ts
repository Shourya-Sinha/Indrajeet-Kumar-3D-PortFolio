import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findOne } from "@/lib/db/repository";
import { requireAdmin } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";
import { buildResumeSnapshot } from "@/lib/resume/role-profiles";
import { diffResumeSnapshots } from "@/lib/resume/hash";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const body = (await req.json()) as {
    profileType?: ResumeProfileType;
    fromVersion?: string;
    toVersion?: string; // "live" compares against current DB state
  };

  const profileType = body.profileType || "general";
  const fromDoc = body.fromVersion
    ? await findOne("resumeVersions", { profileType, version: body.fromVersion })
    : await findOne("resumeVersions", { profileType, isLatest: true });

  if (!fromDoc) {
    return NextResponse.json({ ok: false, error: "Baseline version not found." }, { status: 404 });
  }

  let toSnapshot = await buildResumeSnapshot(profileType);
  let toLabel = "Current Live Profile";
  if (body.toVersion && body.toVersion !== "live") {
    const toDoc = await findOne("resumeVersions", { profileType, version: body.toVersion });
    if (!toDoc) {
      return NextResponse.json({ ok: false, error: "Target version not found." }, { status: 404 });
    }
    toSnapshot = toDoc.profileSnapshot;
    toLabel = toDoc.version;
  }

  const diff = diffResumeSnapshots(fromDoc.profileSnapshot, toSnapshot);
  return NextResponse.json({
    ok: true,
    data: {
      fromVersion: fromDoc.version,
      toVersion: toLabel,
      diff,
    },
  });
}
