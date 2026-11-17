import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { requireAdmin } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";
import { buildResumeSnapshot } from "@/lib/resume/role-profiles";
import { generateAtsResumePdfBuffer } from "@/lib/resume/pdf-generator";
import { generateAtsResumeDocxBuffer } from "@/lib/resume/docx-generator";
import { validateResumePdfBuffer } from "@/lib/resume/ats-validator";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const profile = (req.nextUrl.searchParams.get("profile") || "general") as ResumeProfileType;
  const format = (req.nextUrl.searchParams.get("format") || "pdf").toLowerCase();
  const snapshot = await buildResumeSnapshot(profile);

  if (format === "docx") {
    const docxBuffer = await generateAtsResumeDocxBuffer(snapshot);
    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Preview_${profile}_Resume.docx"`,
      },
    });
  }

  const pdfBuffer = await generateAtsResumePdfBuffer(snapshot);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Preview_${profile}_Resume.pdf"`,
    },
  });
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  let profile: ResumeProfileType = "general";
  try {
    const body = (await req.json()) as { profileType?: ResumeProfileType };
    if (body.profileType) profile = body.profileType;
  } catch {
    // default
  }

  const snapshot = await buildResumeSnapshot(profile);
  const pdfBuffer = await generateAtsResumePdfBuffer(snapshot);
  const validation = await validateResumePdfBuffer(pdfBuffer, snapshot);

  return NextResponse.json({
    ok: true,
    data: {
      profileType: profile,
      snapshot,
      validation,
      previewPdfEndpoint: `/api/admin/resume/preview?profile=${profile}&format=pdf&t=${Date.now()}`,
      previewDocxEndpoint: `/api/admin/resume/preview?profile=${profile}&format=docx&t=${Date.now()}`,
    },
  });
}
