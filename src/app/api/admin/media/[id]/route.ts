import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { deleteById, findOne, updateById } from "@/lib/db/repository";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { deleteStoredMedia } from "@/lib/cloudinary/storage";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const body = (await req.json()) as { altText?: string; folder?: string };
  const updated = await updateById("mediaAssets", id, {
    ...(body.altText !== undefined ? { altText: body.altText } : {}),
    ...(body.folder !== undefined ? { folder: body.folder } : {}),
  });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Media asset not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const existing = await findOne("mediaAssets", { _id: id });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Media asset not found." }, { status: 404 });
  }
  if (!existing.publicId.startsWith("seed/")) {
    await deleteStoredMedia(existing.publicId, existing.storageProvider, existing.resourceType);
  }
  await deleteById("mediaAssets", id);
  await recordAuditLog({
    actorId: auth.user.sub,
    actorEmail: auth.user.email,
    action: "MEDIA_DELETE",
    collectionName: "mediaAssets",
    targetId: id,
    summary: `Deleted media asset ${existing.fileName}`,
    ipAddress: getClientIp(req),
  });
  return NextResponse.json({ ok: true, deleted: true });
}
