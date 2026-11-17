import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { requireAdmin } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";
import { buildResumeSnapshot } from "@/lib/resume/role-profiles";
import { generateAtsResumePdfBuffer } from "@/lib/resume/pdf-generator";
import { validateResumePdfBuffer } from "@/lib/resume/ats-validator";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const profileType = (req.nextUrl.searchParams.get("profile") || "general") as ResumeProfileType;
  const snapshot = await buildResumeSnapshot(profileType);
  const pdfBuffer = await generateAtsResumePdfBuffer(snapshot);
  const report = await validateResumePdfBuffer(pdfBuffer, snapshot);
  return NextResponse.json({ ok: true, data: report });
}
