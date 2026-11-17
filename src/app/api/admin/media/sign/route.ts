import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { requireAdmin } from "@/lib/auth/security";
import { createCloudinarySignedParams } from "@/lib/cloudinary/storage";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  let folder = "portfolio";
  try {
    const body = (await req.json()) as { folder?: string };
    if (body.folder) folder = body.folder;
  } catch {
    // default folder
  }

  const signed = createCloudinarySignedParams(folder);
  return NextResponse.json({ ok: true, data: signed });
}
