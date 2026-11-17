import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany } from "@/lib/db/repository";
import { requireAdmin } from "@/lib/auth/security";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const limit = Math.min(200, Math.max(10, parseInt(req.nextUrl.searchParams.get("limit") || "100", 10)));
  const logs = await findMany("auditLogs", {}, { sort: { createdAt: -1 }, limit });
  return NextResponse.json({ ok: true, data: logs });
}
