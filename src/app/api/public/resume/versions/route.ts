import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const profile = req.nextUrl.searchParams.get("profile") || "general";
  const versions = await findMany(
    "resumeVersions",
    { profileType: profile, isPublic: true, status: "published" },
    { sort: { major: -1, minor: -1, patch: -1 } }
  );

  return NextResponse.json({
    ok: true,
    data: versions.map((v) => ({
      _id: v._id,
      profileType: v.profileType,
      version: v.version,
      title: v.title,
      description: v.description,
      releaseNotes: v.releaseNotes,
      publishedAt: v.publishedAt,
      isLatest: v.isLatest,
      isOriginalBaseline: v.isOriginalBaseline,
      pdfUrl: v.pdfUrl,
      docxUrl: v.docxUrl,
      validationSummary: {
        isValid: v.validationReport?.isValid ?? true,
        pageCount: v.validationReport?.pageCount ?? 1,
        extractedWordCount: v.validationReport?.extractedWordCount ?? 0,
      },
    })),
  });
}
