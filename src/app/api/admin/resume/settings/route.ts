import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findOne, upsertOne } from "@/lib/db/repository";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { resumeSettingsSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const settings = await findOne("resumeSettings", { settingsKey: "primary" });
  return NextResponse.json({ ok: true, data: settings });
}

export async function PUT(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const parsed = resumeSettingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Invalid resume settings." },
      { status: 400 }
    );
  }

  const updated = await upsertOne(
    "resumeSettings",
    { settingsKey: "primary" },
    {
      settingsKey: "primary",
      ...parsed.data,
    }
  );

  await recordAuditLog({
    actorId: auth.user.sub,
    actorEmail: auth.user.email,
    action: "RESUME_SETTINGS_UPDATE",
    collectionName: "resumeSettings",
    targetId: updated._id,
    summary: `Updated resume publishing mode to ${updated.publishingMode}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ ok: true, data: updated });
}
