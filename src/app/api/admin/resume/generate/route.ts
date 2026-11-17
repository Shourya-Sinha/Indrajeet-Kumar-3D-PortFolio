import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";
import { generateOrRefreshResumeDraft } from "@/lib/resume/service";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  let profileType: ResumeProfileType = "general";
  try {
    const body = (await req.json()) as { profileType?: ResumeProfileType };
    if (body.profileType) profileType = body.profileType;
  } catch {
    // default general
  }

  const result = await generateOrRefreshResumeDraft(profileType, "admin-manual-generate");

  await recordAuditLog({
    actorId: auth.user.sub,
    actorEmail: auth.user.email,
    action: "RESUME_GENERATE",
    collectionName: "resumeDrafts",
    targetId: result.draft?._id || result.publishedVersion?._id || profileType,
    summary: `Triggered resume generation for ${profileType} (${result.status})`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ ok: true, data: result });
}
