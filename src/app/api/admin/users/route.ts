import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { createOne, findMany } from "@/lib/db/repository";
import { getClientIp, hashPassword, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { userCreateSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const users = await findMany("users", {}, { sort: { createdAt: -1 } });
  return NextResponse.json({
    ok: true,
    data: users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Validation error." },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const created = await createOne("users", {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
    });

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "USER_CREATE",
      collectionName: "users",
      targetId: created._id,
      summary: `Created admin user ${created.email} (${created.role})`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          _id: created._id,
          email: created.email,
          name: created.name,
          role: created.role,
          isActive: created.isActive,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}
