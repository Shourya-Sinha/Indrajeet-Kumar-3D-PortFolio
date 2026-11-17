import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { deleteById, updateById } from "@/lib/db/repository";
import { getClientIp, hashPassword, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { userUpdateSchema } from "@/lib/validation/schemas";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const parsed = userUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.role !== undefined) patch.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) patch.isActive = parsed.data.isActive;
  if (parsed.data.password) patch.passwordHash = await hashPassword(parsed.data.password);

  const updated = await updateById("users", id, patch);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  await recordAuditLog({
    actorId: auth.user.sub,
    actorEmail: auth.user.email,
    action: "USER_UPDATE",
    collectionName: "users",
    targetId: id,
    summary: `Updated user ${updated.email}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({
    ok: true,
    data: {
      _id: updated._id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      isActive: updated.isActive,
    },
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  if (id === auth.user.sub) {
    return NextResponse.json(
      { ok: false, error: "Cannot delete your own active administrator account." },
      { status: 400 }
    );
  }
  const deleted = await deleteById("users", id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }
  await recordAuditLog({
    actorId: auth.user.sub,
    actorEmail: auth.user.email,
    action: "USER_DELETE",
    collectionName: "users",
    targetId: id,
    summary: `Deleted user ${id}`,
    ipAddress: getClientIp(req),
  });
  return NextResponse.json({ ok: true, deleted: true });
}
