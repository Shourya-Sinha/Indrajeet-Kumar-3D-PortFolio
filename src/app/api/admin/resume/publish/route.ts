import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { resumePublishSchema } from "@/lib/validation/schemas";
import { publishResumeVersion } from "@/lib/resume/service";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const parsed = resumePublishSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }

  try {
    const published = await publishResumeVersion({
      ...parsed.data,
      createdBy: auth.user.email,
    });

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "RESUME_PUBLISH",
      collectionName: "resumeVersions",
      targetId: published._id,
      summary: `Published resume ${published.version} (${published.profileType})`,
      metadata: { version: published.version, profileType: published.profileType },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ ok: true, data: published }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
