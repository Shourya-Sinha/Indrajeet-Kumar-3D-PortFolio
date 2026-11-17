import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { resumeRollbackSchema } from "@/lib/validation/schemas";
import { rollbackResumeToVersion } from "@/lib/resume/service";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const parsed = resumeRollbackSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }

  try {
    const restored = await rollbackResumeToVersion(
      parsed.data.profileType,
      parsed.data.sourceVersion,
      auth.user.email
    );

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "RESUME_ROLLBACK",
      collectionName: "resumeVersions",
      targetId: restored._id,
      summary: `Restored snapshot from ${parsed.data.sourceVersion} into new version ${restored.version}`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ ok: true, data: restored }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
