import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findOne } from "@/lib/db/repository";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ version: string }> }
) {
  await ensureDatabaseSeeded();
  const { version } = await context.params;
  const profile = req.nextUrl.searchParams.get("profile") || "general";
  const doc = await findOne("resumeVersions", {
    profileType: profile,
    version: decodeURIComponent(version),
    isPublic: true,
    status: "published",
  });

  if (!doc) {
    return NextResponse.json({ ok: false, error: "Published version not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: doc });
}
